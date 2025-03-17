import { desc } from "@ponder/client";
import { useQuery } from "@tanstack/react-query";
import { client, schema } from "./lib/ponder";

function Table() {
  const { data } = useQuery({
    queryKey: ["eth-usd-price"],
    queryFn: () =>
      client.db
        .select()
        .from(schema.prices)
        .orderBy(desc(schema.prices.timestamp))
        .limit(10),
  });

  return (
    <table>
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        {data?.map((price) => (
          <tr key={price.id}>
            <td>
              {new Date(Number(price.timestamp) * 1000)
                .toISOString()
                .replace("T", " ")
                .replace(/\.\d+Z$/, "Z")}
            </td>
            <td style={{ textAlign: "left" }}>
              ${Number(price.price).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default Table;
