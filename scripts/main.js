var React = require('react');
var ReactDOM = require('react-dom');
var h = require('./helper');

var units = [
'lb',
'oz',
'pint (U.S.) (pt)',
'pint (British) (pt)',
'fluid ounce (U.S.) (fl oz)',
'fluid ounce (British) (fl oz)',
'cup',
'tbsp',
'dessert spoon',
'tsp'
];

// Add Recipe
// Add ingredients with measurement
// Volumize those ingredients

// var App = React.createClass({
// 	getDefaultState: function() {
// 		return {
// 			recipes: {}
// 			}
// 	},

// 	addRecipe : function(recipe) {
//     var timestamp = (new Date()).getTime();
//     // update the state object
//     this.state.recipes['recipe-' + this.recipe.title] = recipe;
//     // set the state
//     this.setState({ recipes : this.state.recipes });
//   },

// 	render: function() {
// 		var appStyle = {
//         backgroundImage: 'url(' + this.props.src + ')',
//         backgroundColor: 'rgba(0,0,0,.7)',
//         backgroundSize: 'cover',
//         position: 'absolute',
//         top: 0,
//         bottom: 0,
//         right: 0,
//         left: 0
//       };

// 		return (
// 			<div>
// 				<Recipe />
// 				<button onClick={this.addRecipe}>Add Recipe</button>
// 			</div>
// 		);
// 	}
// });

// var Recipe = React.createClass({
// 	render: function() {
// 		return (
// 			<Ingredient />
// 			);
// 	}
// });

// var AddRecipeForm = React.createClass({
//   createRecipe : function(event) {
//     // 1. Stop the form from submitting
//     event.preventDefault();
//     // 2. Take the data from the form and create an object
//     var fish = {
//       title : this.refs.title.value,
//       price : this.refs.price.value,
//       status : this.refs.status.value,
//       desc : this.refs.desc.value,
//       image : this.refs.image.value
//     }

//     // 3. Add the fish to the App State
//     this.props.addFish(fish);
//     this.refs.fishForm.reset();
//   },
//   render : function() {
//     return (
//       <form onSubmit={this.createRecipe}>
// 			<input type="text" ref="recipeTitle" placeholder="Recipe Name"/>
// 			<Ingredients recipeName={this.refs.recipeTitle.value} />
// 			<button type="submit">Save Recipe</button>
// 		</form>
//     )
//   }
// });

var Ingredients = React.createClass({
  getInitialState : function() {
    return {
      ingredients : {},
      servingsCurrent : 1,
      servingsFinal : 0
    }
  }, 
  
  addIngredient : function(ingredient) { 
		var timestamp = (new Date()).getTime();
    // update the state object
    this.state.ingredients['ingredient-' + timestamp] = ingredient;
    // set the state
    this.setState({ ingredients : this.state.ingredients });
  },
  
  renderIngredient : function(key){
    return <Ingredient key={key} index={key} details={this.state.ingredients[key]} />
  },

  addServings : function(servings) {
  	// update the state object
  	this.state.servingsFinal = servings.servingsFinal;
  	this.state.servingsCurrent = servings.servingsCurrent;
  	
  	// set state
  	this.setState({
  		servingsCurrent : this.state.servingsCurrent,
  		servingsFinal : this.state.servingsFinal
  	});

  	Object.keys(this.state.ingredients).map(this.calculateServings);

  	this.state.servingsCurrent = this.state.servingsFinal;
  	this.setState({ servingsCurrent : this.state.servingsCurrent});
  },

  calculateServings : function(key) {
  	var quantPretty = null;
  	var quantRound;
  	var remainder;
  	var prevUnit;
  	var quantity = this.state.ingredients[key].quantity;
  	var unit = this.state.ingredients[key].unit;
  	var i = this.state.servingsCurrent;
  	var f = this.state.servingsFinal;

  	quantity = quantity / i;
  	quantity = quantity * f;

  	// Normalize serving sizes
  	switch(unit) {
    	case 'tsp':
    		if (quantity >= 3) {
    			if (quantity % 3 ) {
    				remainder = quantity % 3;
    				quantity = quantity / 3;
    				prevUnit = 'tsp';
    				unit = 'tbsp';
    				quantRound = Math.floor(quantity);
    				quantPretty = this.prettify(quantRound, unit, remainder, prevUnit);
    			} else {
    				quantity = quantity/3;
    				unit = 'tbsp';
    			}
    		}
    	break;

    	case 'tbsp':
				if (quantity >= 4) {
    			if (quantity % 4 ) {
    				remainder = quantity % 4;
    				quantRound = quantity - remainder;
    				quantRound = quantRound / 4;
    				quantRound = quantRound * .25;
    				prevUnit = 'tbsp';
    				unit = 'cup';
    				quantPretty = this.prettify(quantRound, unit, remainder, prevUnit);
    			} else {
    				quantity = quantity/16;
    				unit = 'cup';
    			}
    		}
    		break;

    		case 'oz':
				if (quantity >= 4) {
    			if (quantity % 4 ) {
    				remainder = quantity % 4;
    				quantRound = quantity - remainder;
    				quantRound = quantRound / 4;
    				quantRound = quantRound * .25;
    				prevUnit = 'oz';
    				unit = 'lb';
    				quantPretty = this.prettify(quantRound, unit, remainder, prevUnit);
    			} else {
    				quantity = quantity/16;
    				unit = 'lb';
    			}
    		}
    		break;

    		case 'fl oz':
				if (quantity >= 4) {
    			if (quantity % 4 ) {
    				remainder = quantity % 4;
    				quantRound = quantity - remainder;
    				quantRound = quantRound / 4;
    				quantRound = quantRound * .5;
    				prevUnit = 'fl oz';
    				unit = 'cup (fl)';
    				quantPretty = this.prettify(quantRound, unit, remainder, prevUnit);
    			} else {
    				quantity = quantity/8;
    				unit = 'cup (fl)';
    			}
    		}
    		break;

    		case 'cup (fl)':
    		if (quantity >= 4) {
    			if (quantity % 4 ) {
    				remainder = quantity % 4;
    				quantity = quantity / 4;
    				prevUnit = 'cup (fl)';
    				unit = 'quart';
    				quantRound = Math.floor(quantity);
    				quantPretty = this.prettify(quantRound, unit, remainder, prevUnit);
    			} else {
    				quantity = quantity/4;
    				unit = 'quart';
    			}
    		}
    		break;

    		case 'quart':
    		if (quantity >= 4) {
    			if (quantity % 4 ) {
    				remainder = quantity % 4;
    				quantity = quantity / 4;
    				prevUnit = 'quart';
    				unit = 'gallon';
    				quantRound = Math.floor(quantity);
    				quantPretty = this.prettify(quantRound, unit, remainder, prevUnit);
    			} else {
    				quantity = quantity/4;
    				unit = 'gallon';
    			}
    		}
    		break;

  	}

  	this.state.ingredients[key].quantity = h.round(quantity);
  	this.state.ingredients[key].unit = unit;
  	this.state.ingredients[key].quantPretty = quantPretty;

  	this.setState({ ingredients : this.state.ingredients });
  },

  prettify : function(quantRound, unit, remainder, prevUnit) {
  	return quantRound + ' ' + unit + ' + ' + remainder + ' ' + prevUnit;
  },

  render : function() {
    return (
    	<div className="ingredients">
    		<div className="col-md-8">
    			<h1>Add ingredients here and then...</h1>
    	    	<table className="ingredient-list">
    	    	<tbody>
    	        	{Object.keys(this.state.ingredients).map(this.renderIngredient)}
    	    	</tbody>
    	    	</table>
    	    	<AddIngredientForm addIngredient={this.addIngredient} />
    	    </div>
    	    <div className="col-md-4 volumize">
    	    	<CalculateServings addServings={this.addServings} servingsCurrent={this.state.servingsCurrent} />
    	    </div>
      </div>
    )
  }
});

var QuantPretty = React.createClass({
	render: function() {
		var details = this.props.details;
		return (
				<td className="quantPretty" colSpan="2">{details.quantPretty}</td>
		)
	}
});

var TdQuant = React.createClass({
	render: function() {
		var details = this.props.details;
		return (
          <td className="quantity">{details.quantity}</td>
		)
	}
});

var TdUnit = React.createClass({
	render: function() {
		var details = this.props.details;
		return <td>{details.unit}</td>
	}
});

var Ingredient = React.createClass({
  render : function() {
    var details = this.props.details;
    var trUnit;
    if (details.quantPretty) {
    	trUnit = <QuantPretty details={this.props.details}/>;
    } else {
    	trUnit = <big><TdQuant details={this.props.details} /><TdUnit details={this.props.details} /></big>;
    }
    return (
    	<tr className="ingredient">  
        <td className="ingredient-name">
          {details.name}
        </td>
        {trUnit}
      </tr>
    )
  }
});

var AddIngredientForm = React.createClass({
  createIngredient : function(event) {
    // 1. Stop the form from submitting
    event.preventDefault();
    // 2. Take the data from the form and create an object
    var ingredient = {
      name : this.refs.name.value,
      quantity : this.refs.quantity.value,
      unit : this.refs.unit.value,
      quantPretty : ''
    }

    // 3. Add the ingredient to the App State
    this.props.addIngredient(ingredient);
    this.refs.ingredientForm.reset();
  },
  render : function() {
    return (
       <form className="ingredient-edit" ref="ingredientForm" onSubmit={this.createIngredient}>
			<input type="text" ref="name" placeholder="Ingredient Name" />
			<input type="number" ref="quantity" placeholder="1" step="any" />
			<select ref="unit" placeholder="unit">
				<option>tsp</option>
				<option>tbsp</option>
				<option>cup</option>
				<option>oz</option>
				<option>lb</option>
				<option>fl oz</option>
				<option>cup (fl)</option>
				<option>quart</option>
				<option>gallon</option>
				<option>item (veggie, herb, etc)</option>
			</select>
			<button type="submit">Add Ingredient</button>
		</form>
    )
  }
});

var CalculateServings = React.createClass({
	handleEvent : function(event) {
    // 1. Stop the form from submitting
    event.preventDefault();
    // 2. Take the data from the form and create an object
    var servings = {
      servingsFinal : this.refs.servingsFinal.value,
      servingsCurrent : this.refs.servingsCurrent.value,
    }

    // 3. Add the ingredient to the App State
    this.props.addServings(servings);
    this.refs.servingsFinal.value = '';
  },

	render: function() {
		return (
			<div className="volumizer">
				<h2>Volumize!</h2>
				<form ref="volumizer" onSubmit={this.handleEvent}>
					<label>Current Serving Size</label>
  	  		<input type="number" ref="servingsCurrent" value={this.props.servingsCurrent} />
  	  		<label>Final Serving Size</label>
  	  		<input type="number" ref="servingsFinal" placeholder="Number of servings" />
  	  		<button type="submit">Go</button>
  	  	</form>
  	  </div>
		)
	}
});

ReactDOM.render (
	<Ingredients />,
	document.querySelector('#main')
	);