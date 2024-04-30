from flask import Flask, jsonify, redirect
from factorization import Factorization
import time
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

app = Flask(
    __name__,
    static_url_path='',
    static_folder='../frontend'
)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///factorization_history.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

factorization = Factorization()


class FactorizationHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.String)
    factors = db.Column(db.Text)
    date = db.Column(db.DateTime, default=datetime.now())


with app.app_context():
    db.create_all()


@app.route('/')
def redirect_to_index():
    return redirect('/index.html')


@app.route('/factorize/<int:number>', methods=['POST'])
def factorize_number_with_param(number):
    start_time = time.time()
    factors = factorization.pollard_rho_factor(number)
    end_time = time.time()
    time_taken = (end_time - start_time) * 1000
    history_entry = FactorizationHistory(
        number=str(number), factors=str(factors))
    db.session.add(history_entry)
    db.session.commit()
    factors = [str(factor) for factor in factors]
    return jsonify({'factors': factors, 'time_taken': time_taken})


@app.route('/history')
def show_history():
    history = FactorizationHistory.query.all()
    history_data = []
    for entry in history:
        history_data.append({
            'number': entry.number,
            'factors': entry.factors,
            'date': entry.date.strftime('%Y-%m-%d %H:%M:%S')
        })
    return jsonify({'history': history_data})


app.run(debug=True)
