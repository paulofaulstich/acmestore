import React, { useState } from "react";

import { Container, Card, Row, Button, Form } from "react-bootstrap";

export default function Products(props) {
  const [amount, setAmount] = useState(null);

  const handleBuy = async ({ productId, price }) => {
    const value = String(price * amount);
    await props.market.methods
      .buyProduct(productId, amount)
      .send({ from: props.account, value });
    props.refresh();
  };

  if (!props.products)
    return (
      <Container className="p-5">
        <h3>Loading Products ...</h3>
      </Container>
    );

  if (props.products.length === 0)
    return (
      <Container className="p-5">
        <h3>No products found</h3>
      </Container>
    );
  return (
    <Container className="mt-5 ml-5">
      <Row className="center-arts">
        {props.products.map((product, index) => (
          <Card className="mr-3 mb-3" style={{ width: "15rem" }} key={index}>
            <Card.Body>                            
              <img class="product price img" src="images/eth.png"/>
              <span class="product price">{window.web3.utils.fromWei(String(product.price))}</span>
              <Card.Img variant="top" src={"images/" + product.productId + ".png"} />              
              <Card.Title className="product code"> Product Code: {product.productId}</Card.Title>              
              <Card.Text className="product inventory">Inventory: {product.quantity}</Card.Text>
              <Card.Text className="product tokens">Tokens: {product.tokenstoReward}</Card.Text>
              <Card.Text>
                Seller:
                {product.seller.substring(0, 5) +
                  "..." +
                  product.seller.substring(37, 42)}
              </Card.Text>
            </Card.Body>
            <Card.Footer>
              <Row>
                {product.quantity > 0 ? (
                  <>
                    <Form.Control
                      className="ml-1"
                      style={{ width: "60%" }}
                      type="number"
                      placeholder="Amount"
                      onChange={e => setAmount(e.target.value)}
                    />
                    <Button className="ml-2" onClick={() => handleBuy(product)}>
                      Buy
                    </Button>
                  </>
                ) : (
                    <Button className="ml-1" disabled variant="danger">
                      Sold Out
                  </Button>
                  )}
              </Row>
            </Card.Footer>
          </Card>
        ))}      
      </Row>
    </Container>
  );
}
