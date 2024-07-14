from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

from langchain_community.vectorstores import Chroma


from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import re
from langchain_huggingface import HuggingFaceEmbeddings
from llama_index.embeddings.langchain import LangchainEmbedding
import shutil
from langchain_community.vectorstores import Chroma
import os

from langchain_huggingface import HuggingFaceEmbeddings

import pandas as pd
from vanna.remote import VannaDefault

from langchain.docstore.document import Document


import requests
import json


from constants import CHROMA_PATH, DATA_PATH, VANNA_MODEL_NAME, DB_PATH
# in case u pull it 1st time just create api_key.py file and add TYPHOON_API_KEY str variable in it
from api_key import TYPHOON_API_KEY, VANNA_API_KEY


# function
# ===============================================================================================================================================================================
def load_documents():
    loader = PyPDFDirectoryLoader(DATA_PATH)
    documents = loader.load()

    return documents

def get_embedding_function():
    lc_embed_model = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-mpnet-base-v2"
    )
    return lc_embed_model


def rag_preparing():
    print("=================== starting ===========================")

    # document loader
    documents = load_documents()
    print("loaded documents")

    # text splitter
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=500,
        length_function=len,
        is_separator_regex=True,
    )
    chunks = text_splitter.split_documents(documents)
    print("chunks splitted=============")
    print(chunks)
    print("chunks splitted=============")

    # creating chunk_list
    chuncks_list = []
    for i in range(len(chunks)):
        chunk = {
            # "id": re.sub("[^0-9a-zA-Z_-]","_",f"{i}"),
            # "content": chunks[i].page_content,   
            "id": re.sub("[^0-9a-zA-Z_-]","_",f"{chunks[i].metadata['source']}-{i}"),
            "content": chunks[i].page_content,   
            "sourcepage": chunks[i].metadata['page'],
            "sourcefile": chunks[i].metadata['source'][len(DATA_PATH)-1:]
        }
        chuncks_list.append(chunk)
    print("creating chunks list=============")
    print(chuncks_list)
    print("creating chunks list=============")


    # embedding to vector
    embed_func = LangchainEmbedding(get_embedding_function())
    for chk in chuncks_list:
        chk['content_vector'] = embed_func.get_text_embedding(chk['content'])
    print("embedding to vector", len(chuncks_list[0]['content_vector']))

    # create a new DB from the documents.
    db = Chroma.from_documents(chunks, get_embedding_function(), persist_directory=CHROMA_PATH)

    if os.path.exists(CHROMA_PATH):
        shutil.rmtree(CHROMA_PATH)

        db.persist()
        print(f"Saved {len(chunks)} chunks to {CHROMA_PATH}")

    print("=================== done ===========================")


# ============ call_typhoon ==================================================================
def format_retrieved_documents(data_list: list[tuple[Document]]) -> str:
    print('data_list:', data_list)
    retrieved_documents = ""
    for item in data_list:
        # Extract the 'content' and 'sourcepage' values
        print('item:', item)
        content = item[0].page_content
        source = f"{item[0].metadata['source']}-page{item[0].metadata['page']}"
        retrieved_documents += "source -> " + source + ", content -> " + content + "\n"
        print()
        print("source: " + source)
        print()
    return retrieved_documents

def search_vectorstores(query_text:str) -> str:
    try:
        db = Chroma(persist_directory=CHROMA_PATH, embedding_function=get_embedding_function())
        embed_func = LangchainEmbedding(get_embedding_function())
        # text to vector space with 768 dimensions
        query_vector = embed_func.get_text_embedding(query_text)
        results = db.similarity_search_by_vector_with_relevance_scores(query_vector, k=3)
        
        return format_retrieved_documents(results)
    except:
        print('error in search vector stores')
        return ''

def call_vanna(query_text:str):

    vn = VannaDefault(model=VANNA_MODEL_NAME, api_key=VANNA_API_KEY)
    vn.connect_to_sqlite(DB_PATH)
    vanna_response = vn.ask(query_text, visualize=False, allow_llm_to_see_data=True)

    markdown_table = None
    #in case there is df from Vanna
    if vanna_response is not None:
        sql, df, fig = vanna_response

        # save to markdown file
        markdown_table = df.to_markdown(index=False)
    return markdown_table # return markdown table string or None

def call_typhoon(query_text, context_list):
    print("context_list", context_list)
    endpoint = 'https://api.opentyphoon.ai/v1/chat/completions'
    context_list.append({"content": query_text, "role": "user"})
    res = requests.post(endpoint, json={
        "model": "typhoon-v1.5-instruct",
        "max_tokens": 512,
        "messages": context_list,
        "temperature": 0.4,
        "top_p": 0.9,
        "top_k": 0,
        "repetition_penalty": 1.05,
        "min_p": 0.05
    }, headers={
        "Authorization": f"Bearer {TYPHOON_API_KEY}",
    })

    bytes_string = res.content.decode(encoding='utf-8', errors='strict')
    response = json.loads(bytes_string)
    context_list.append(response['choices'][0]['message'])
    print("===================== Finish ========================")
    return context_list

def should_call_vanna(content_string:str) -> bool:
    return 'CANTTT' in content_string or \
        ' unable ' in content_string or \
        'sorry ' in content_string or \
        'an AI language model' in content_string or \
        'ขออภัย' in content_string


def ask_and_call_typhoon(req):
    print("==================== Start calling Typhoon =======================")
    # starting conversation

    # example req
    # req = {
    #     "history": [],
    #     "recent": {
    #         "content": "what are the top 10 albums by sales?",
    #         # "content": "What are Mobil SHC 600 Series Product features",
    #         "role": "user"
    #     }
    # }

    query_text = req['recent']['content']
        

    retrieved_document = ''
    retrieved_table_markdown = ''

    # retrieve documents
    retrieved_document = search_vectorstores(query_text)
    print("Search vector successfully.")

    MESSAGE_SYSTEM_CONTENT = f"""
    - You are a an AI assistance service agent that helps helps and provide information to support business team such as marketing,
    sales of Exxon Mobil Company focusing on Lubricants with answering questions.
    - if there's thai character then answer in thai 
    - Please answer the question based on the provided context below. 
    - Make sure not to make any changes to the context, if possible, when preparing answers to provide accurate responses. 
    - If the answer cannot be found in context just answer with word "CANTTTTT" only, do not try to make up an answer.
    - your knowledge based on this retrieved document: {retrieved_document}
    - please always give the source of retrieved document to your answer at the end every time, if no source say no source
    in this format "Source: source_from_retrieved document"
    """
    system_prompt_context = {"content": MESSAGE_SYSTEM_CONTENT, "role": "system"}


    context_list_context = []
    if req['history'] == None:
        # for default context when ask for the 1st time
        context_list_context = [system_prompt_context]
        print("context_list_context was empty, now it's not")
    else:
        context_list_context = req['history']
        print("using context history")


    print("going to call tyhoon. . . . . .")    
    latest_response = call_typhoon(query_text, context_list_context)

    # if no answer then ask vanna first then return final the answer
    # call vanna
    if  should_call_vanna(latest_response[-1]['content']):
        print("original latest_response[-1]['content'] :", latest_response[-1]['content'])
        print('CANTT found calling Vanna')
        retrieved_table_markdown = '' # reset retrieved_table_markdown
        retrieved_table_markdown = call_vanna(query_text)
        print("Call VannaAI Successfully.")
        if retrieved_table_markdown is None: # vanna dunno
            print(". . . . . .VannaAI did not know the query. . . . . .")
        else:
            # call ask with new prompt that fit vanna
            MESSAGE_SYSTEM_VANNA_CONTENT = f"""
            - You are a an AI assistance service agent that helps helps and provide information to support business team such as marketing,
            sales of Exxon Mobil Company focusing on Lubricants with answering questions. 
            - if there's thai character then answer in thai 
            - you must always say the source is from database at the end of your answer too every time in format like this Source: Database
            - Please answer the question based on the provided context below. 
            - Make sure not to make any changes to the context, if possible, when preparing answers to provide accurate responses. 
            - If the answer cannot be found in context, just politely say that you do not know, do not try to make up an answer.
            - your knowledge based on this markdown table: {retrieved_table_markdown} 
            """
            system_prompt_vanna_context = {"content": MESSAGE_SYSTEM_VANNA_CONTENT, "role": "system"}

            chat_context = [system_prompt_vanna_context]
            b = call_typhoon(query_text, chat_context)
            temp_list_context = context_list_context
            temp_list_context.pop()
            temp_list_context.append(b[-1])
            context_list_context = temp_list_context
            
            print('vanna', context_list_context[-1])
            return context_list_context
    else:
        # return nornaml case
        print(MESSAGE_SYSTEM_CONTENT)
        print()
        print('normal', latest_response[-1])
        print()
        return latest_response

# ===============================================================================================================================================================================
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'

# ===============================================================================================================================================================================

# controller
@app.route("/")
@cross_origin(origin='*',headers=['access-control-allow-origin','Content-Type'])
def index():
    return "welcome to LLM service"


@app.route("/rag", methods=["POST"])
@cross_origin(origin='*',headers=['access-control-allow-origin','Content-Type'])
def rag():  
    rag_preparing()
    return "done RAG", 201


@app.route("/ask-typhoon", methods=["POST"])
@cross_origin(origin='*',headers=['access-control-allow-origin','Content-Type'])
def ask_typhoon():

    # rag_preparing()

    request_data = request.get_json()
    if request_data['history'] == None or request_data['history'] == []:
        print("1st time")
    try:

        response = ask_and_call_typhoon(request_data)
    
        return jsonify(response), 200
    except KeyError:
        print("Error in Indx Typhoon")
        rag_preparing()
        ask_typhoon(request_data)


if __name__ == '__main__':
    app.run(debug=True)
