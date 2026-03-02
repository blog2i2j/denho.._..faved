import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useContext, useState } from 'react';
import { StoreContext } from '@/store/storeContext.ts';
import { observer } from 'mobx-react-lite';

export const OnboardingBanner = observer(() => {
  const [isVisible, setIsVisible] = useState(true);
  const store = useContext(StoreContext);

  if (!isVisible || store.hideOnboardingBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="bg-primary text-primary-foreground flex min-w-max items-center gap-4 rounded-lg px-6 py-3 shadow-lg">
        <span className="text-sm font-medium">Walk through the onboarding</span>
        <Link
          to="/setup/auth"
          className="bg-primary-foreground text-primary rounded px-3 py-1 text-sm font-medium transition-opacity hover:opacity-90"
        >
          Start
        </Link>
        <button
          onClick={() => setIsVisible(false)}
          className="text-primary-foreground ml-2 transition-opacity hover:opacity-70"
          aria-label="Dismiss banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
});
