export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">💰 我的记账本</h1>
        <p className="text-gray-600 mb-8">个人财务管理应用</p>
        <a
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          开始使用
        </a>
      </div>
    </main>
  )
}
