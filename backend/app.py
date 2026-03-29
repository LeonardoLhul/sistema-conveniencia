from flask import Flask, jsonify, request
from flask_cors import CORS
from db import get_connection
from auth import authenticate_user, create_user, get_user_by_token
from products import get_all_products, get_product_by_id, create_product, update_product, delete_product, search_products
from report import generate_sales_report
from stock import get_stock_by_product, get_all_stock, update_stock, add_stock, remove_stock, set_min_quantity, get_low_stock_products, consume_internal
from sales import get_all_sales, get_sales_by_user, create_sale
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
    # aceitar estoque inicial e quantidade mínima se fornecidos
    stock_qty = data.get('stock')
    min_qty = data.get('min_stock')
    
    # aceitar categoria como string ou ID
    category_id = data.get('category_id')
    category_name = data.get('category')

    result = create_product(
        name=data['name'],
        barcode=data.get('barcode'),
        price=data['price'],
        cost_price=data.get('cost_price'),
        active=data.get('active', 1),
        category_id=category_id,
        category=category_name,
        stock=stock_qty,
        min_quantity=min_qty
    )
    
    return jsonify(result), (201 if result['success'] else 400)

@app.route("/api/products/<int:product_id>", methods=["PUT"])
@require_token
def update_existing_product(product_id):
    data = request.get_json()

    category_id = data.get('category_id')
    category_name = data.get('category')

    if category_id is not None:
        category_id = int(category_id)

    result = update_product(
        product_id=product_id,
        name=data.get('name'),
        barcode=data.get('barcode'),
        price=data.get('price'),
        cost_price=data.get('cost_price'),
        active=data.get('active'),
        category_id=category_id,
        category=category_name
    )
    return jsonify(result)

    # 🔥 Atualizar estoque se vier no payload
    if data.get('stock') is not None:
        update_stock(product_id, data.get('stock'))

    if data.get('min_stock') is not None:
        set_min_quantity(product_id, data.get('min_stock'))

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


# ============ VENDAS ============

@app.route("/api/sales", methods=["GET"])
@require_token
def list_sales():
    """Retorna vendas. ADMIN/GERENTE veem todas, CASAS só suas"""
    user = request.user
    if user['role'] in ('ADMIN', 'GERENTE'):
        result = get_all_sales()
    else:
        result = get_sales_by_user(user['id'])

    # debug output
    if result.get('success') and isinstance(result.get('data'), list):
        print(f"[DEBUG] list_sales returned {len(result['data'])} records for user {user['id']}")
    else:
        print(f"[DEBUG] list_sales error: {result}")

    status = 200 if result.get('success') else 500
    return jsonify(result), status

@app.route("/api/sales", methods=["POST"])
@require_token
def create_sale_route():
    """Cadastra uma venda"""
    data = request.get_json() or {}
    required = ['timestamp', 'total', 'paymentMethod', 'items']
    for field in required:
        if field not in data:
            return jsonify({"success": False, "message": f"Campo {field} é obrigatório"}), 400
    user = request.user
    ts = data['timestamp']
    # MySQL expects a datetime object; frontend sends millis since epoch
    try:
        from datetime import datetime
        if isinstance(ts, (int, float)):
            ts = datetime.fromtimestamp(ts / 1000.0)
    except Exception:
        pass

    try:
        result = create_sale(
            user_id=user['id'],
            timestamp=ts,
            total=data['total'],
            payment_method=data['paymentMethod'],
            items=data['items']
        )
    except Exception as e:
        # log unexpected exception
        print(f"Erro interno ao criar venda: {e}")
        result = {"success": False, "message": str(e)}

    status = 200 if result.get('success') else 500
    if not result.get('success'):
        # print detailed result so developer can inspect
        print("create_sale result:", result)
    return jsonify(result), status

@app.route("/api/stock/consume", methods=["POST"])
@require_token
def consume_internal_route():
    """Baixa itens do estoque sem registrar venda."""
    data = request.get_json() or {}
    items = data.get('items')

    if not items or not isinstance(items, list):
        return jsonify({"success": False, "message": "Lista de itens é obrigatória"}), 400

    result = consume_internal(items)
    status = 200 if result.get('success') else 400
    return jsonify(result), status



# ============ RELATÓRIOS ============

@app.route("/api/reports/sales", methods=["GET"])
@require_token
def get_sales_report():
    """Gera relatório de vendas por período"""
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    
    if not start_date or not end_date:
        return jsonify({"success": False, "message": "Datas de início e fim são obrigatórias"}), 400
        
    result = generate_sales_report(start_date, end_date)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 500

# ============ CATEGORIAS ============

@app.route("/categories", methods=["GET"])
def get_categories():
    try:
        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT id, categoria FROM categories WHERE active = 1")
        categories = cursor.fetchall()

        cursor.close()
        conn.close()

        return jsonify(categories), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
