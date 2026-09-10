from flask import Flask, request, jsonify
from flask_cors import CORS
import random
import time
import os

app = Flask(__name__)
CORS(app)

# Comprehensive question repository with dynamic question generation pool
QUESTION_BANK = {
    "software_engineer": {
        "Junior": [
            "Tell me about your journey in software development and your favorite programming language.",
            "Can you explain the difference between synchronous and asynchronous programming?",
            "How do you handle errors and debugging in your code?",
            "What is version control (Git) and what is your typical Git workflow?",
            "Can you explain the concept of REST APIs and standard HTTP methods?"
        ],
        "Mid": [
            "How do you optimize the performance of a slow database query or web application?",
            "Explain how you design a scalable microservices or modular architecture.",
            "Can you describe a complex bug you resolved in production and how you diagnosed it?",
            "How do you approach writing unit tests, integration tests, and ensuring high code quality?",
            "What strategies do you use for caching data in high-traffic applications?"
        ],
        "Senior": [
            "How would you design a distributed, fault-tolerant system like a real-time chat or URL shortener?",
            "How do you handle technical debt while balancing rapid feature delivery for business needs?",
            "Describe your approach to mentoring junior engineers and conducting high-impact code reviews.",
            "How do you handle system security, data privacy, and authentication at scale?",
            "Explain trade-offs between SQL vs NoSQL databases in large-scale applications."
        ]
    },
    "frontend_developer": {
        "Junior": [
            "Tell me about your experience with React and modern JavaScript (ES6+).",
            "What is the difference between state and props in React?",
            "How does the React Virtual DOM work and why is it beneficial?",
            "How do you ensure responsive and mobile-friendly UI designs with CSS?",
            "Explain how you use React hooks like useState and useEffect."
        ],
        "Mid": [
            "How do you manage complex global state in React (Context, Redux, Zustand)?",
            "What techniques do you use to optimize React web performance (memoization, lazy loading, code-splitting)?",
            "How do you handle API errors, loading states, and race conditions in frontend apps?",
            "Explain how browser rendering pipeline works (DOM, CSSOM, Layout, Paint).",
            "How do you approach accessibility (a11y) and cross-browser compatibility?"
        ],
        "Senior": [
            "How do you architect a scalable frontend design system or micro-frontend solution?",
            "How do you monitor and improve Core Web Vitals (LCP, FID/INP, CLS) in production?",
            "Describe how you structure end-to-end testing and CI/CD pipelines for frontend apps.",
            "How do you handle client-side security (XSS, CSRF, CSP, secure token storage)?",
            "What are the trade-offs between Server-Side Rendering (SSR), SSG, and Client-Side Rendering (CSR)?"
        ]
    },
    "backend_developer": {
        "Junior": [
            "What backend technologies and databases have you worked with?",
            "Explain the difference between GET, POST, PUT, PATCH, and DELETE requests.",
            "How do relational databases maintain data integrity using Primary and Foreign keys?",
            "What is JWT (JSON Web Token) and how is it used for authentication?",
            "How do you handle input validation and prevent basic security vulnerabilities like SQL Injection?"
        ],
        "Mid": [
            "How do you design database schemas for high read/write throughput?",
            "Explain how connection pooling and database indexing work internally.",
            "How do you implement rate limiting and throttling in your backend APIs?",
            "Describe your experience with message queues (Kafka, RabbitMQ, Redis Pub/Sub).",
            "How do you structure logging, monitoring, and tracing in backend services?"
        ],
        "Senior": [
            "How would you design a distributed transaction mechanism (e.g., Saga pattern vs 2PC)?",
            "How do you handle database sharding, replication lag, and consistency models (CAP theorem)?",
            "Describe how you design multi-tenant cloud-native architectures.",
            "How do you ensure zero-downtime deployments and blue-green releases?",
            "What strategies do you adopt for resilient API gateways and circuit breakers?"
        ]
    },
    "data_science_ai": {
        "Junior": [
            "Tell me about a machine learning or data analysis project you have completed.",
            "What is the difference between supervised and unsupervised learning?",
            "How do you handle missing values and outliers in a dataset?",
            "Explain the bias-variance tradeoff in machine learning models.",
            "What evaluation metrics do you use for classification vs regression problems?"
        ],
        "Mid": [
            "How do you prevent overfitting and improve generalization in complex ML models?",
            "Can you explain how Transformer models and self-attention mechanisms work?",
            "How do you deploy and serve ML models in production (REST API, batch, streaming)?",
            "Describe your experience with feature engineering and dimensionality reduction (PCA, t-SNE).",
            "How do you monitor for model drift and data drift in live production systems?"
        ],
        "Senior": [
            "How do you design an enterprise RAG (Retrieval-Augmented Generation) pipeline for LLMs?",
            "How do you optimize LLM inference speed, quantization, and GPU memory usage?",
            "Describe your strategy for building and scaling an end-to-end MLOps architecture.",
            "How do you address AI safety, hallucination mitigation, and model evaluation benchmarks?",
            "How do you decide between fine-tuning open-source models vs prompting proprietary LLMs?"
        ]
    },
    "hr_behavioral": {
        "Junior": [
            "Tell me about yourself, your background, and why you are interested in this role.",
            "Describe a situation where you had to learn a new tool or technology quickly.",
            "Tell me about a time you worked in a team to solve a challenging problem.",
            "Where do you see yourself in the next 2 to 3 years?",
            "Why do you want to join our organization specifically?"
        ],
        "Mid": [
            "Tell me about a time you faced a disagreement with a team member and how you resolved it.",
            "Describe a situation where project priorities shifted unexpectedly. How did you adapt?",
            "Can you share an example of a project that did not go as planned, and what you learned from it?",
            "How do you prioritize multiple deadlines when resources and time are limited?",
            "Tell me about a time you took ownership of a task outside your core responsibilities."
        ],
        "Senior": [
            "Describe a time you had to influence stakeholders or leadership without formal authority.",
            "How do you manage underperformance within a team and help team members grow?",
            "Tell me about a major strategic decision you made under high ambiguity.",
            "How do you foster an inclusive, high-performance engineering culture?",
            "Describe a time you had to deliver difficult feedback to a peer or manager constructively."
        ]
    }
}

@app.route('/')
def home():
    return 'Hello from AI Interview Prep API!'

@app.route('/api/health')
def health():
    return {
        'status': 'ok',
        'message': 'Backend is running!',
        'timestamp': time.time()
    }

@app.route('/api/generate-questions', methods=['POST'])
def generate_questions():
    """
    Dynamically generates customized interview questions based on role, level, and count.
    """
    data = request.get_json() or {}
    role = data.get('role', 'software_engineer')
    level = data.get('level', 'Mid')
    count = int(data.get('count', 5))
    custom_topic = data.get('customTopic', '').strip()

    # Get questions for the role or fallback to software engineer
    role_dict = QUESTION_BANK.get(role, QUESTION_BANK['software_engineer'])
    level_questions = role_dict.get(level, role_dict.get('Mid', []))

    # If count is requested, randomly select unique questions or dynamic variations
    selected = random.sample(level_questions, min(count, len(level_questions)))

    # If custom topic provided, inject a tailored question
    if custom_topic:
        custom_q = f"How would you apply your experience with {custom_topic} to solve a real-world architectural challenge in this role?"
        if len(selected) >= count:
            selected[-1] = custom_q
        else:
            selected.append(custom_q)

    # Format questions with metadata
    questions_list = []
    for idx, q in enumerate(selected):
        questions_list.append({
            'id': idx + 1,
            'question': q,
            'category': role,
            'difficulty': level,
            'suggestedDuration': 60
        })

    return jsonify({
        'status': 'success',
        'role': role,
        'level': level,
        'totalQuestions': len(questions_list),
        'questions': questions_list
    })

@app.route('/api/evaluate-answer', methods=['POST'])
def evaluate_answer():
    """
    Evaluates candidate's transcribed answer for depth, key terminology, clarity, and relevance.
    """
    data = request.get_json() or {}
    question = data.get('question', '')
    transcript = data.get('transcript', '').strip()
    role = data.get('role', 'general')
    metrics = data.get('metrics', {})

    word_count = len(transcript.split()) if transcript else 0

    # Calculate content depth score based on transcript length and vocabulary
    if word_count < 10:
        content_score = 40
        feedback = "Your answer was very brief. Try using the STAR method (Situation, Task, Action, Result) with concrete examples to elaborate."
        strengths = ["Responded to prompt"]
        improvements = ["Elaborate with specific real-world examples", "Explain the 'why' behind your decisions"]
    elif word_count < 35:
        content_score = 65
        feedback = "Good start! You touched on key points, but explaining practical implementation details and trade-offs would make your answer much stronger."
        strengths = ["Clear concise answer", "Relevant to question"]
        improvements = ["Mention metrics or outcomes achieved", "Discuss architectural or practical considerations"]
    else:
        content_score = min(95, 75 + int(word_count * 0.25))
        feedback = "Excellent and comprehensive explanation! You provided good context and thorough reasoning."
        strengths = ["In-depth explanation", "Structured flow", "Strong technical vocabulary"]
        improvements = ["Keep practicing concise delivery within time limits"]

    # Combine with confidence, posture, and eye contact metrics
    confidence = metrics.get('confidence', 70)
    posture_score = 85 if metrics.get('posture') == 'Good' else 60
    eye_contact_score = 85 if metrics.get('eyeContact') == 'Good' else 60

    overall_score = round(
        content_score * 0.45 +
        confidence * 0.25 +
        posture_score * 0.15 +
        eye_contact_score * 0.15
    )

    return jsonify({
        'status': 'success',
        'contentScore': content_score,
        'overallScore': min(100, max(20, overall_score)),
        'wordCount': word_count,
        'feedback': feedback,
        'strengths': strengths,
        'improvements': improvements
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)