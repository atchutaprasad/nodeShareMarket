function greet(name) {
  return `Hello, ${name}!`;
}

function stokeRender(request){
    return {message : request.selectedStoke }
}

module.exports = { greet, stokeRender }; // Exporting the function