import './styles/index.css'
import { AppRoutes } from './routes';
import { Layout } from './components';

function App() {
  return (
    <Layout>
      <AppRoutes />
    </Layout>
  )
}

export default App