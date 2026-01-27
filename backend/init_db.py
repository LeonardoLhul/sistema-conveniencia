from db import get_connection

def init_database():
    """Verifica conexão com o banco de dados"""
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)
    
    try:
        # Verificar se a tabela users existe
        cursor.execute("SHOW TABLES LIKE 'users'")
        if not cursor.fetchone():
            print("❌ Tabela 'users' não encontrada no banco de dados!")
            return
        
        # Verificar quantos usuários existem
        cursor.execute("SELECT COUNT(*) as count FROM users")
        count = cursor.fetchone()['count']
        
        print(f"✅ Banco de dados conectado com sucesso!")
        print(f"✅ {count} usuário(s) encontrado(s) na tabela 'users'")
        
    except Exception as e:
        print(f"❌ Erro: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    init_database()
