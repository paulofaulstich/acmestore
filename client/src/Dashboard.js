import React from "react";
import { Container, Card, Table } from "react-bootstrap";

export default function Dashboard(props) {
  let renderContent;
  if (!props.sales)
    renderContent = (
      <Container>
        <p>Loading Sales ...</p>
      </Container>
    );
  else if (props.sales.length === 0)
    renderContent = (
      <Container>
        <p>No sales found</p>
      </Container>
    );
  else
    renderContent = (
      <Table striped bordered hover className="text-center">
        <thead>
          <tr>
            <th>Product Code</th>
            <th>Qty Purshased</th>
          </tr>
        </thead>
        <tbody>
          {props.sales.map(sale => (
            <tr key={sale.productId}>
              <td>{sale.productId}</td>
              <td>{sale.amount}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  return (
    <Container className="mt-5" style={{ height: "100%" }}>
      <Card className="p-5">
        <Card.Title style={{ fontStyle: "italic" }}>Dashboard</Card.Title>
        {renderContent}
        <Card.Text style={{ fontStyle: "italic" }}>
          Total Tokens: {props.balance || 0}
        </Card.Text>
      </Card>
    </Container>
  );
}
