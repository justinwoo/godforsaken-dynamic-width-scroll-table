Warning:

Trying to reference lib/fixed-scroll-table.js in the root of the project will totally break, as a naive reference/npm link will try to install another copy of React. This will inevitably break when you attempt to build it with webpack, as there will be two different Reacts and you will get this error: Only a ReactOwner can have refs. This usually means that you're trying to add a ref to a component that doesn't have an owner (that is, was not created inside of another component's render() method. Try rendering this component inside of a new top-level component which will hold the ref.

The solution is to create a symlink by doing `ln -s example/node_modules node_modules` in the root

tl;dr javascript sucks
