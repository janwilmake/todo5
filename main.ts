interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export class TodoListDO {
  private todos: Todo[] = [];
  private storage: DurableObjectStorage;

  constructor(state: DurableObjectState) {
    this.storage = state.storage;
  }

  async initialize() {
    const storedTodos = await this.storage.get('todos');
    this.todos = storedTodos || [];
  }

  async fetch(request: Request) {
    await this.initialize();

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    };

    if (request.method === 'GET') {
      return new Response(JSON.stringify(this.todos), {
        headers: corsHeaders,
      });
    }

    if (request.method === 'POST') {
      const todo = await request.json() as { text: string };
      const newTodo: Todo = {
        id: crypto.randomUUID(),
        text: todo.text,
        completed: false,
      };
      this.todos.push(newTodo);
      await this.storage.put('todos', this.todos);
      return new Response(JSON.stringify(newTodo), {
        headers: corsHeaders,
      });
    }

    if (request.method === 'PUT') {
      const { id } = await request.json() as { id: string };
      const todoIndex = this.todos.findIndex(t => t.id === id);
      if (todoIndex !== -1) {
        this.todos[todoIndex].completed = !this.todos[todoIndex].completed;
        await this.storage.put('todos', this.todos);
        return new Response(JSON.stringify(this.todos[todoIndex]), {
          headers: corsHeaders,
        });
      }
      return new Response('Todo not found', { status: 404, headers: corsHeaders });
    }

    if (request.method === 'DELETE') {
      const { id } = await request.json() as { id: string };
      const todoIndex = this.todos.findIndex(t => t.id === id);
      if (todoIndex !== -1) {
        const deletedTodo = this.todos.splice(todoIndex, 1)[0];
        await this.storage.put('todos', this.todos);
        return new Response(JSON.stringify(deletedTodo), {
          headers: corsHeaders,
        });
      }
      return new Response('Todo not found', { status: 404, headers: corsHeaders });
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }
}

export default {
  async fetch(request: Request, env: any) {
    const url = new URL(request.url);
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const id = env.TODO_LIST.idFromName(ip);
    const todoList = env.TODO_LIST.get(id);
    return todoList.fetch(request);
  },
};