/**
 * Generate App API - Updated to use free AI APIs with credit system
 */

import { Hono } from 'hono';
import { AIService } from '../services/ai';
import { SubscriptionService } from '../services/subscription';
import { getDb } from '../lib/db';

const generateAppRouter = new Hono();

generateAppRouter.post('/', async (c) => {
  try {
    const { fid, description, template, model = 'auto' } = await c.req.json();

    if (!fid) {
      return c.json({ success: false, error: 'FID required' }, 400);
    }

    // Get or create user
    const db = getDb();
    let user = db.prepare('SELECT * FROM users WHERE fid = ?').get(fid) as any;

    if (!user) {
      const insertStmt = db.prepare('INSERT INTO users (fid) VALUES (?)');
      const result = insertStmt.run(fid);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid) as any;
    }

    // Get user's subscription and credits
    const subscriptionService = new SubscriptionService();
    const subscription = await subscriptionService.getUserSubscription(user.id);
    const creditBalance = await subscriptionService.getCreditBalance(user.id);

    // Create AI service
    const aiService = new AIService(creditBalance.balance, subscription?.tier || 'starter');

    // Generate app
    let result;
    if (template) {
      // Use template (no AI cost)
      const code = getTemplateCode(template);
      result = {
        code,
        response: `I've loaded the ${template} template for you!`
      };
    } else {
      // Use AI generation
      result = await aiService.generateApp(description, { model });
    }

    // Deduct credits
    const cost = model === 'gpt-4' || model === 'claude-3-opus' ? 300 : 50;
    await subscriptionService.deductCredits(user.id, cost, `App generation (${model})`);

    // Store app
    const appId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const insertStmt = db.prepare(`
      INSERT INTO apps (user_id, app_id, name, code, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    insertStmt.run(
      user.id,
      appId,
      description.substring(0, 50) || 'Generated App',
      result.code,
      description
    );

    return c.json({
      success: true,
      app: {
        id: appId,
        name: description.substring(0, 50) || 'Generated App',
        code: result.code,
        hasContract: false
      },
      response: result.response,
      creditsRemaining: creditBalance.balance - cost
    });
  } catch (error: any) {
    console.error('Generate app error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

function getTemplateCode(template: string): string {
  const templates: Record<string, string> = {
    todo: `export default function TodoApp() {
  const [todos, setTodos] = React.useState([]);
  const [input, setInput] = React.useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, done: false }]);
      setInput('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-zinc-900 min-h-screen">
      <h1 className="text-3xl font-bold text-white mb-6">Todo List</h1>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          className="flex-1 px-4 py-2 bg-zinc-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Add a task..."
        />
        <button
          onClick={addTodo}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Add
        </button>
      </div>
      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg"
          >
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
              className="w-5 h-5 accent-purple-600"
            />
            <span className={\`flex-1 text-white \${todo.done ? 'line-through text-zinc-500' : ''}\`}>
              {todo.text}
            </span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <p className="mt-6 text-zinc-500 text-center">
        {todos.filter(t => t.done).length} / {todos.length} completed
      </p>
    </div>
  );
}`,

    counter: `export default function Counter() {
  const [count, setCount] = React.useState(0);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-900">
      <h1 className="text-6xl font-bold text-white mb-8">{count}</h1>
      <div className="flex gap-4">
        <button
          onClick={() => setCount(count - 1)}
          className="w-16 h-16 text-3xl bg-red-600 text-white rounded-full hover:bg-red-700"
        >
          -
        </button>
        <button
          onClick={() => setCount(0)}
          className="w-16 h-16 text-2xl bg-zinc-600 text-white rounded-full hover:bg-zinc-700"
        >
          0
        </button>
        <button
          onClick={() => setCount(count + 1)}
          className="w-16 h-16 text-3xl bg-green-600 text-white rounded-full hover:bg-green-700"
        >
          +
        </button>
      </div>
      <p className="mt-8 text-zinc-500">Click the buttons to change the count</p>
    </div>
  );
}`,

    clicker: `export default function ClickerGame() {
  const [coins, setCoins] = React.useState(0);
  const [clicks, setClicks] = React.useState(0);
  const [multiplier, setMultiplier] = React.useState(1);
  const [autoClicker, setAutoClicker] = React.useState(0);

  React.useEffect(() => {
    if (autoClicker > 0) {
      const interval = setInterval(() => {
        setCoins(c => c + autoClicker);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoClicker]);

  const handleClick = () => {
    setCoins(c => c + multiplier);
    setClicks(c => c + 1);
  };

  const upgradeMultiplier = () => {
    if (coins >= 100) {
      setCoins(c => c - 100);
      setMultiplier(m => m + 1);
    }
  };

  const buyAutoClicker = () => {
    if (coins >= 50) {
      setCoins(c => c - 50);
      setAutoClicker(a => a + 1);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-zinc-900 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-white mb-2">Coin Clicker</h1>
      <p className="text-center text-zinc-400 mb-8">Click to earn coins!</p>

      <div className="text-center mb-8">
        <p className="text-6xl font-bold text-yellow-400 mb-2">{coins}</p>
        <p className="text-zinc-500">coins</p>
      </div>

      <button
        onClick={handleClick}
        className="w-full h-40 text-4xl bg-gradient-to-b from-yellow-400 to-yellow-600 text-white rounded-2xl shadow-lg hover:scale-105 transition-transform active:scale-95 mb-8"
      >
        🪙
      </button>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-800 p-4 rounded-lg">
          <p className="text-zinc-400 text-sm">Multiplier</p>
          <p className="text-2xl font-bold text-white">x{multiplier}</p>
          <button
            onClick={upgradeMultiplier}
            disabled={coins < 100}
            className="mt-2 w-full px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-zinc-700 disabled:text-zinc-500"
          >
            Upgrade (100)
          </button>
        </div>

        <div className="bg-zinc-800 p-4 rounded-lg">
          <p className="text-zinc-400 text-sm">Auto Clicker</p>
          <p className="text-2xl font-bold text-white">{autoClicker}/s</p>
          <button
            onClick={buyAutoClicker}
            disabled={coins < 50}
            className="mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-zinc-700 disabled:text-zinc-500"
          >
            Buy (50)
          </button>
        </div>
      </div>

      <div className="mt-6 text-center text-zinc-500">
        <p>Total clicks: {clicks}</p>
      </div>
    </div>
  );
}`
  };

  return templates[template] || templates.todo;
}

export default generateAppRouter;
