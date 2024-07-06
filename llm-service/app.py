from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin

from langchain_community.vectorstores import Chroma


from langchain_community.document_loaders import PyPDFDirectoryLoader
from langchain_community.document_loaders import UnstructuredMarkdownLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import re
from langchain_huggingface import HuggingFaceEmbeddings
from llama_index.embeddings.langchain import LangchainEmbedding
import shutil
from langchain_community.vectorstores import Chroma
import os

from langchain_huggingface import HuggingFaceEmbeddings

import pandas as pd

from langchain.docstore.document import Document


import requests
import json


from constants import CHROMA_PATH, DATA_PATH
# in case u pull it 1st time just create api_key.py file and add TYPHOON_API_KEY str variable in it
from api_key import TYPHOON_API_KEY


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
def call_vanna(query_text:str):
    # temp
    #in case there is df from Vanna
    data = {
        'ProductSKU': [
            'Blue - Large 4L - 5L', 'Charcoal - Large 4L - 5L', 'Gold - Large 4L', 'Mobil 1 Gold 4L - 6L', 'Mobil Delvac Modern 7L',
            'Mobil Super AIO - 7L', 'Mobil Super AIO 3L - 6L', 'Mobil Super FF 4L - 7L',
            'Mobil_Delvac_Legend_6L_-_7L', 'Silver - Large 4L'],
        'ProductName': [
            'Blue Large', 'Mobil Super AIO', 'Gold Large', 'Mobil 1 Gold', 'Mobil Delvac Modern',
            'Mobil Super AIO - Charcoal', 'Mobil Super AIO', 'Mobil Super FF',
            'Mobil Delvac Legend', 'Silver Large'
        ],
        'TotalScan': [500, 11730, 5336, 3589, 24739, 12618, 376, 137394, 6685, 12689]
    }

    df = pd.DataFrame(data)

    # save to markdown file
    markdown_table = df.to_markdown(index=False)
    return markdown_table # return markdown table string or None

def format_retrieved_documents(data_list: list[tuple[Document]]) -> str:
    retrieved_documents = ""
    for item in data_list:
        # Extract the 'content' and 'sourcepage' values
        content = item[0].page_content
        sourcepage = f"{item[0].metadata['source']}-page{item[0].metadata['page']}"
        retrieved_documents += "sourcepage: " + sourcepage + ", content: " + content + "\n"

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


def call_typhoon(query_text, context_list):
    print(context_list)
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
    if 'CANTTT' in latest_response[-1]['content'] or ' unable ' in latest_response[-1]['content'] or ' sorry ' in latest_response[-1]['content'] or 'As an AI language model' in latest_response[-1]['content']:
        print('CANTT found')
        print("Call VannaAI Successfully.")
        retrieved_table_markdown = call_vanna(query_text)
        # call ask with new prompt that fit vanna
        MESSAGE_SYSTEM_VANNA_CONTENT = f"""
        - You are a an AI assistance service agent that helps helps and provide information to support business team such as marketing,
        sales of Exxon Mobil Company focusing on Lubricants with answering questions. 
        - if there's thai character then answer in thai 
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
        print('normal', latest_response[-1])
        return latest_response

# ===============================================================================================================================================================================
app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'

# ===============================================================================================================================================================================

# controller
@app.route("/")
def index():
    return "welcome to LLM service"




@app.route("/rag", methods=["POST"])
def rag():  
    rag_preparing()
    return "done RAG", 201


@app.route("/ask-typhoon", methods=["POST"])
@cross_origin()
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
