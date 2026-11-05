import time
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from .registry import knowledge_registry
from ..config import settings

class KnowledgeChangeHandler(FileSystemEventHandler):
    def __init__(self):
        super().__init__()
        self.last_reload = 0.0

    def on_any_event(self, event):
        if event.is_directory:
            return
        
        src_path = str(event.src_path)
        if src_path.endswith((".md", ".yaml", ".yml")):
            # Debounce de 0.5s para evitar múltiplos disparos no mesmo salvamento
            now = time.time()
            if now - self.last_reload > 0.5:
                self.last_reload = now
                print(f"[KnowledgeWatcher] Alteração detectada em {src_path}. Recarregando base de conhecimento...")
                try:
                    knowledge_registry.load_all()
                except Exception as e:
                    print(f"[KnowledgeWatcher] Erro no hot-reload: {e}")

class KnowledgeWatcher:
    def __init__(self):
        self.observer = Observer()
        self.handler = KnowledgeChangeHandler()
        self.is_running = False

    def start(self):
        knowledge_dir = settings.KNOWLEDGE_DIR
        if not knowledge_dir.exists():
            knowledge_dir.mkdir(parents=True, exist_ok=True)

        self.observer.schedule(self.handler, str(knowledge_dir), recursive=True)
        self.observer.start()
        self.is_running = True
        print(f"[KnowledgeWatcher] Monitorando {knowledge_dir} para Hot-Reload...")

    def stop(self):
        if self.is_running:
            self.observer.stop()
            self.observer.join(timeout=1.0)
            self.is_running = False

knowledge_watcher = KnowledgeWatcher()
