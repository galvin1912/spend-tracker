import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { HelmetProvider } from "react-helmet-async";
import { auth } from "./configs/firebase";
import { fetchUserInfo } from "./features/user/userActions";
import AppRoutes from "./routes";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(fetchUserInfo(user.uid));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <HelmetProvider>
      <AppRoutes />
    </HelmetProvider>
  );
}

export default App;
