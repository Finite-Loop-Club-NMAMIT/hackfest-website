import { LineWobble } from '@uiball/loaders';

export default function AnalyticsTab() {
  return (
    <div className="flex flex-col items-center">
      <div className="w-full">
        <h1 className="py-10 text-center text-4xl font-bold">Analytics Dashboard</h1>
      </div>
      
      <div className="w-full max-w-4xl p-8 shadow-sm ">
        <div className="flex flex-col items-center justify-center space-y-8 py-12 text-center">          
          <h2 className="text-3xl font-bold text-white">Analytics are being collected</h2>
          <div className="rounded-full bg-blue-50 p-6">
            <LineWobble size={200} color="#4F46E5" />
          </div>
          <p className="max-w-lg text-xl text-white font-medium">
            We&apos;re gathering insights from your event data. Comprehensive analytics will be available soon.
          </p>
          
          <div className="mt-6 rounded-md bg-indigo-100 px-8 py-4 text-indigo-800 border border-indigo-200">
            <p className="font-bold text-lg">Page is coming soon</p>
          </div>
        </div>
      </div>
    </div>
  );
}
