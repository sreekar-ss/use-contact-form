import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-2xl text-center">
        <h1 className="text-4xl font-bold mb-4">
          use-contact-form Backend
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
          Nodemailer + Gmail/SMTP Version
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
          Completely free, no API limits!
        </p>
        <div className="space-x-4">
          <Link
            href="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Contact Form
          </Link>
          <Link
            href="/api/contact"
            className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            View API Endpoint
          </Link>
        </div>
        
        <div className="mt-12 text-left bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Gmail Setup (Quick):</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Go to <a href="https://myaccount.google.com/security" target="_blank" className="text-blue-600 underline">Google Account Security</a></li>
            <li>Enable 2-Factor Authentication</li>
            <li>Go to <a href="https://myaccount.google.com/apppasswords" target="_blank" className="text-blue-600 underline">App Passwords</a></li>
            <li>Create app password, name it "Contact Form"</li>
            <li>Copy <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">.env.example</code> to <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">.env</code></li>
            <li>Add your Gmail and app password to <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">.env</code></li>
            <li>Run <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">npm run dev</code></li>
          </ol>
          
          <div className="mt-4 p-3 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-700 rounded">
            <p className="text-xs text-yellow-800 dark:text-yellow-300">
              ⚠️ Gmail Limit: 500 emails/day. Use Google Workspace for 2,000/day.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

