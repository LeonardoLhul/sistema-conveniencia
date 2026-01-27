from flask import Flask, jsonify, request
from flask_cors import CORS
from db import get_connection
from auth import authenticate_user, create_user, get_user_by_token
from products import get_all_products, get_product_by_id, create_product, update_product, delete_product, search_products
from stock import get_stock_by_product, get_all_stock, update_stock, add_stock, remove_stock, set_min_quantity, get_low_stock_products
from init_db import init_database
from functools import wraps

app = Flask(__name__)
CORS(app)

# Inicializar banco de dados na primeira execução
init_database()

def require_token(f):
    """Decorator para verificar autenticação"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"success": False, "message": "Token não fornecido"}), 401
        
        # Remover "Bearer " do token se existir
        if token.startswith('Bearer '):
            token = token[7:]
        
        result = get_user_by_token(token)
        if not result['success']:
            return jsonify(result), 401
        
        request.user = result['user']
        return f(*args, **kwargs)
    
    return decorated_function

@app.route("/")
def home():
    return jsonify({"message": "Backend conectado ao MySQL 🚀"})

@app.route("/test-db")
def test_db():
    try:
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT 1")
        cursor.close()
        conn.close()
        return jsonify({"message": "Conexão com banco OK ✅"})
    except Exception as e:
        return jsonify({"message": f"Erro: {str(e)}"}), 500

@app.route("/api/auth/login", methods=["POST"])
def login():
    """Autentica um usuário e retorna um token"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"success": False, "message": "Username e password são obrigatórios"}), 400
    
    result = authenticate_user(data['username'], data['password'])
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 401

@app.route("/api/auth/register", methods=["POST"])
def register():
    """Registra um novo usuário"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({"success": False, "message": "Username e password são obrigatórios"}), 400
    
    role = data.get('role', 'SALES')
    result = create_user(data['username'], data['password'], role)
    
    return jsonify(result), (201 if result['success'] else 400)

@app.route("/api/auth/verify", methods=["GET"])
@require_token
def verify_token():
    """Verifica se o token é válido"""
    return jsonify({
        "success": True,
        "user": request.user
    }), 200

# ============ PRODUTOS ============

@app.route("/api/products", methods=["GET"])
def list_products():
    """Lista todos os produtos"""
    search = request.args.get('search')
    
    if search:
        result = search_products(search)
    else:
        result = get_all_products()
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 500

@app.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    """Retorna um produto específico"""
    result = get_product_by_id(product_id)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 404

@app.route("/api/products", methods=["POST"])
@require_token
def create_new_product():
    """Cria um novo produto"""
    data = request.get_json()
    
    if not data or not data.get('name') or data.get('price') is None:
        return jsonify({"success": False, "message": "Nome e preço são obrigatórios"}), 400
    
    result = create_product(
        name=data['name'],
        barcode=data.get('barcode'),
        price=data['price'],
        cost_price=data.get('cost_price'),
        active=data.get('active', 1)
    )
    
    return jsonify(result), (201 if result['success'] else 400)

@app.route("/api/products/<int:product_id>", methods=["PUT"])
@require_token
def update_existing_product(product_id):
    """Atualiza um produto existente"""
    data = request.get_json()
    
    result = update_product(
        product_id=product_id,
        name=data.get('name'),
        barcode=data.get('barcode'),
        price=data.get('price'),
        cost_price=data.get('cost_price'),
        active=data.get('active')
    )
    
    return jsonify(result), (200 if result['success'] else 404)

@app.route("/api/products/<int:product_id>", methods=["DELETE"])
@require_token
def delete_existing_product(product_id):
    """Deleta um produto"""
    result = delete_product(product_id)
    
    return jsonify(result), (200 if result['success'] else 404)

# ============ ESTOQUE ============

@app.route("/api/stock", methods=["GET"])
def list_all_stock():
    """Lista o estoque de todos os produtos"""
    result = get_all_stock()
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 500

@app.route("/api/stock/product/<int:product_id>", methods=["GET"])
def get_product_stock(product_id):
    """Retorna o estoque de um produto específico"""
    result = get_stock_by_product(product_id)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 404

@app.route("/api/stock/low", methods=["GET"])
def list_low_stock():
    """Retorna produtos com estoque baixo"""
    result = get_low_stock_products()
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 500

@app.route("/api/stock/product/<int:product_id>/update", methods=["PUT"])
@require_token
def update_product_stock(product_id):
    """Atualiza o estoque de um produto"""
    data = request.get_json()
    
    if data.get('quantity') is None:
        return jsonify({"success": False, "message": "Quantidade é obrigatória"}), 400
    
    result = update_stock(product_id, data['quantity'])
    
    return jsonify(result), (200 if result['success'] else 404)

@app.route("/api/stock/product/<int:product_id>/add", methods=["PUT"])
@require_token
def add_product_stock(product_id):
    """Adiciona quantidade ao estoque"""
    data = request.get_json()
    
    if data.get('quantity') is None:
        return jsonify({"success": False, "message": "Quantidade é obrigatória"}), 400
    
    result = add_stock(product_id, data['quantity'])
    
    return jsonify(result), (200 if result['success'] else 404)

@app.route("/api/stock/product/<int:product_id>/remove", methods=["PUT"])
@require_token
def remove_product_stock(product_id):
    """Remove quantidade do estoque"""
    data = request.get_json()
    
    if data.get('quantity') is None:
        return jsonify({"success": False, "message": "Quantidade é obrigatória"}), 400
    
    result = remove_stock(product_id, data['quantity'])
    
    return jsonify(result), (200 if result['success'] else 404)

@app.route("/api/stock/product/<int:product_id>/min", methods=["PUT"])
@require_token
def set_product_min_quantity(product_id):
    """Define a quantidade mínima de estoque"""
    data = request.get_json()
    
    if data.get('min_quantity') is None:
        return jsonify({"success": False, "message": "Quantidade mínima é obrigatória"}), 400
    
    result = set_min_quantity(product_id, data['min_quantity'])
    
    return jsonify(result), (200 if result['success'] else 404)

if __name__ == "__main__":
    app.run(debug=True, port=5000)

