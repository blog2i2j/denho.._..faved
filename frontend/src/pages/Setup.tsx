import { Button } from '@/components/ui/button.tsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.tsx';
import { observer } from 'mobx-react-lite';
import { useContext, useState } from 'react';
import { StoreContext } from '@/store/storeContext.ts';
import { Navigate, useNavigate } from 'react-router-dom';

export const Setup = observer(() => {
  const store = useContext(StoreContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const submit = async () => {
    setIsLoading(true);
    const success = await store.initializeDatabase();
    if (success) {
      navigate('/', { replace: true });
    }
    setIsLoading(false);
  };

  if (!isLoading && !store.isSetupRequired) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-start gap-8 px-3 py-16 text-left">
      <div className="flex items-center justify-center gap-2.5">
        <img src="logo.png" alt="Faved logo" className="h-auto w-[30px]" />
        <h2 className="text-2xl font-semibold tracking-tight">Faved</h2>
      </div>
      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle className="text-lg">Welcome to Faved demo!</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-8">
          <p>
            Before you can use the application, we need to set up the database with demo content. Click the button below
            to proceed.
          </p>

          <div className="rounded-lg bg-blue-100 p-4 dark:bg-blue-600">
            <p className="italic">
              All demo accounts are private. Feel free to add your own links - they will not be accessed by anyone
              except you.
            </p>
            <br />
            <p className="italic">Demo accounts are deleted after 14 days.</p>
          </div>
          <Button className="w-full" disabled={isLoading} onClick={submit}>
            {isLoading ? 'Creating Database...' : 'Initialize Demo'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
});
