import "./App.css";
import { PonderProvider } from "@ponder/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Table from "./Table";
import { client } from "./lib/ponder";

const queryClient = new QueryClient();

function App() {
  return (
    <PonderProvider client={client}>
      <QueryClientProvider client={queryClient}>
        <h1>ETH-USD Latest Prices</h1>
        <div className="card">
          <Table />
        </div>
      </QueryClientProvider>
    </PonderProvider>
  );
}

export default App;
