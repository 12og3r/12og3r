import { useParams } from 'react-router-dom';

export default function Post() {
  const { slug } = useParams();
  return <div data-testid="post">post: {slug}</div>;
}
