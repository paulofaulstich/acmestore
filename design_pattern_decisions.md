## Restricting Access

The Marketplace contract implements two modifiers, `onlyOwner` and `onlySeller` to restrict access to specific addresses in function

## Mortal

Owner of the contract can call the `kill` function to selfdestruct the contract owner can withdraw available funds and make the contract useless.

## Circuit Breaker

Owner of the contract can call the `stopInEmergency` function to allow contract functionality to be stopped.