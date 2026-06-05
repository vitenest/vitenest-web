import { Helmet } from 'react-helmet-async';

export default function ToolCatalog() {
  return (
    <>
      <Helmet><title>Explore Tools | ViteNest</title></Helmet>
      <main className="container" style={{paddingTop: '120px', minHeight: '80vh'}}>
        <h1>Explore Our Arsenal of Free Tools</h1>
        <p>A highly filterable, search-driven hub for all tools.</p>
      </main>
    </>
  );
}
