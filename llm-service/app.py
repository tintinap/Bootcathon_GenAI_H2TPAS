from flask import Flask, request, jsonify

app = Flask(__name__)


# controller
@app.route("/")
def index():
    return "welcome to LLM service"

@app.route("/ask-typhoon", methods=["POST"])
def ask_typhoon():
    request_data = request.get_json()
    data = {
        "somedata": request_data
    }
 
    return jsonify(data), 200


if __name__ == '__main__':
    app.run(debug=True)
