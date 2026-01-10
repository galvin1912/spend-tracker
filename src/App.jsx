import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { HelmetProvider } from "react-helmet-async";
import { App as AntdApp } from "antd";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { auth } from "./configs/firebase";
import { fetchUserInfo } from "./features/user/userActions";
import { setMessageInstance } from "./utils/messageUtil";
import AppRoutes from "./routes";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

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
      <AntdApp>
        <AppContent />
      </AntdApp>
    </HelmetProvider>
  );
}

// Separate component to use App.useApp() hook
function AppContent() {
  const { message } = AntdApp.useApp();

  // Set message instance for Redux actions
  useEffect(() => {
    setMessageInstance(message);
  }, [message]);

  return <AppRoutes />;
}

export default App;
