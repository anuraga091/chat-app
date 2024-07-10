import React from 'react';
import { auth, googleProvider } from '../firebase';

const Auth = ({ setUser }) => {
  const signInWithGoogle = async () => {
    try {
      const result = await auth.signInWithPopup(googleProvider);
      setUser(result.user);
    } catch (error) {
      console.error('Error signing in with Google', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <button
        onClick={signInWithGoogle}
        className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
      >
        Sign in with Google
      </button>
    </div>
  );
};

export default Auth;
