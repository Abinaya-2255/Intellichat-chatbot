from flask import Flask, request, jsonify, render_template
import requests

app = Flask(__name__)

# Memory to keep the conversation natural
chat_history = []

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    try:
        user_input = request.json.get("message")
        
        # Stricter Persona to prevent "Human/Assistant" hallucinations
        system_instruction = (
            "You are IntelliChat, a highly advanced AI Assistant. "
            "Respond naturally and directly to the user. "
            "Do not label your responses with 'Assistant:' or 'AI:'. "
            "Do not continue the conversation on behalf of the user."
        )
        
        # Build context from the last 5 messages
        history_context = ""
        for entry in chat_history[-5:]:
            history_context += f"User: {entry['user']}\nAssistant: {entry['bot']}\n"
        
        full_prompt = f"{system_instruction}\n\n{history_context}User: {user_input}\nAssistant:"

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "phi3",
                "prompt": full_prompt,
                "stream": False,
                "options": {
                    "num_predict": 150, 
                    "temperature": 0.5,
                    "stop": ["User:", "Human:", "Assistant:"] # Force stops the AI
                }
            }
        )

        reply = response.json()["response"].strip()
        chat_history.append({"user": user_input, "bot": reply})

        return jsonify({"reply": reply})

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"reply": "System Error: Connection to Core lost."})

if __name__ == "__main__":
    app.run(debug=True)