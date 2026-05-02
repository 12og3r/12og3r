import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nProvider } from '@/hooks/useI18n';
import Home from '@/routes/Home';
import Post from '@/routes/Post';
import About from '@/routes/About';
import NotFound from '@/routes/NotFound';

export default function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/en" replace />} />
          <Route path="/:lang">
            <Route index element={<Home />} />
            <Route path="posts/:slug" element={<Post />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </I18nProvider>
  );
}
