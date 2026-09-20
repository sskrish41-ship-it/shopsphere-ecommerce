from flask import Blueprint, jsonify, request
from app.models import BlogPost

blogs_bp = Blueprint('blogs', __name__)

@blogs_bp.route('', methods=['GET'])
def get_blogs():
    posts = BlogPost.query.order_by(BlogPost.created_at.desc()).all()
    return jsonify({'posts': [p.to_dict() for p in posts]}), 200

@blogs_bp.route('/<string:slug>', methods=['GET'])
def get_blog_by_slug(slug):
    post = BlogPost.query.filter_by(slug=slug).first_or_404()
    return jsonify({'post': post.to_dict()}), 200
