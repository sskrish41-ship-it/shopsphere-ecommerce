from flask import Blueprint, request, jsonify
from app.models import db, ContactMessage

contact_bp = Blueprint('contact', __name__)

@contact_bp.route('', methods=['POST'])
def submit_contact_message():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    subject = data.get('subject', '').strip()
    message = data.get('message', '').strip()

    if not name or not email or not subject or not message:
        return jsonify({'error': 'All fields are required'}), 400

    msg = ContactMessage(
        name=name,
        email=email,
        subject=subject,
        message=message
    )
    db.session.add(msg)
    db.session.commit()

    return jsonify({'message': 'Thank you! Your message has been sent successfully.'}), 201
