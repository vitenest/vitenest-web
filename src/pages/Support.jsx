import { Helmet } from 'react-helmet-async';

export default function Support() {
  return (
    <>
      <Helmet><title>Support & FAQ | ViteNest</title></Helmet>
      <main className="container" style={{paddingTop: '120px', minHeight: '80vh'}}>
        <h1>Support & FAQ</h1>
        <p>Reduce support tickets and provide self-serve help.</p>
      </main>
    </>
  );
}
