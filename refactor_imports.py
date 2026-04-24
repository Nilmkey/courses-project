import os

frontend_root = os.path.abspath(r"C:\Users\nilmkis\desktop\courses-project\frontend")

def refactor_imports():
    for root, dirs, files in os.walk(frontend_root):
        # Skip certain directories
        if '.next' in root or 'node_modules' in root:
            continue
            
        for file in files:
            if not file.endswith(('.ts', '.tsx', '.js', '.jsx', '.css', '.mjs')):
                continue
            if file.startswith('.env'):
                continue
                
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, frontend_root)
            
            # Calculate depth for relative backend path
            # lib/auth.ts -> ['lib', 'auth.ts'] -> len 2 -> ../../backend/
            # proxy.ts -> ['proxy.ts'] -> len 1 -> ../backend/
            depth = len(rel_path.replace('\\', '/').split('/'))
            backend_rel = '../' * depth + 'backend/'
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content.replace('@/frontend/', '@/')
            
            # Replace @/backend/ with calculated relative path
            # We use a trick to avoid replacing already replaced paths if the script runs twice
            # but since we are looking for the exact literal @/backend/, it should be fine.
            new_content = new_content.replace('@/backend/', backend_rel)
            
            if content != new_content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Refactored: {rel_path}")

if __name__ == "__main__":
    refactor_imports()
