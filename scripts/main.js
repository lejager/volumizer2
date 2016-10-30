var React = require('react');
var ReactDOM = require('react-dom');
var h = require('./helper');
import ToggleSwitch from './switch';

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

var us = {
  'tsp' : 3,
  'tbsp' : 4,
  'cup' : null,
  'oz' : 16,
  'lb' : null,
  'fl oz' : 4,
  'cup (fl)' : 4,
  'quart' : 4,
  'gallon' : null,
  'item (veggie, herb, etc)' : null
}

var metric = {
  'ml' : 1000,
  'l' : null,
  'g' : 1000,
  'kg' : null,
  'item (veggie, herb, etc)' : null
}

// var us = ['tsp','tbsp','cup','oz','lb','fl oz','cup (fl)','quart','gallon', 'item (veggie, herb, etc)'];
// var metric = ['ml','l','g','kg','item (veggie, herb, etc)'];

var Ingredients = React.createClass({
  getInitialState : function() {
    return {
      ingredients : {},
      servingsCurrent : 1,
      servingsFinal : 1,
      metricSystem: false,
      prettify: false
    }
  },

  getSystem : function() {
    let metricSystem = this.state.metricSystem;
    let system = metricSystem ? metric : us;
    return system;
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

    if (isNaN(servings.servingsCurrent) || servings.servingsCurrent === '') {
      servings.servingsCurrent = this.state.servingsCurrent;
      console.log(this.state.servingsCurrent);
    }

  	// update the state object
  	this.state.servingsFinal = servings.servingsFinal;
  	this.state.servingsCurrent = servings.servingsCurrent;
  	
  	// set state
  	this.setState({
  		servingsCurrent : this.state.servingsCurrent,
  		servingsFinal : this.state.servingsFinal
  	});

    // calculate new quantities for each ingredient
  	Object.keys(this.state.ingredients).map(this.calculateServings);

  	this.state.servingsCurrent = this.state.servingsFinal;
  	this.setState({ servingsCurrent : this.state.servingsCurrent});
  },

  calculateServings : function(key) {
    var totalQuantity = this.state.ingredients[key].totalQuantity;
  	var initUnit = this.state.ingredients[key].initUnit;
    var currentUnit = this.state.ingredients[key].initUnit;
  	var i = this.state.servingsCurrent;
  	var f = this.state.servingsFinal;
    var prevUnit; // null by default
    var renderUnit = this.state.ingredients[key].renderUnit;
    let remainder;
    var system = this.getSystem();
    var prettify = this.state.prettify;

    // do the calculations on the total amount in the intial unit ie. 42 tsp
  	totalQuantity = totalQuantity / i;
  	totalQuantity = totalQuantity * f;

    // set the unit quantity to the total quantity. unit quantity will be normalized.
    var unitQuantity = totalQuantity;

    //** update object keys to run over the metric system.
    const units = Object.keys(system);

    // loop over the units
    for (var i = 0; i < units.length; i++) {
      let unit = units[i]; // ie teaspoon
      let quant = system[units[i]]; // ie the quantity needed to move up a unit; ie 3 teaspoons in a tablespoon

      if (currentUnit === unit) {
        
        if (quant && unitQuantity >= quant) {
          remainder = unitQuantity % quant;
          console.log('remainder',remainder);
          // unitQuantity = unitQuantity - remainder;
          unitQuantity = unitQuantity / quant;
          prevUnit = units[i];
          currentUnit = units[i+1];

          // special handling for tablespoon to cup conversion in order to show quarter cups
          if (prevUnit === 'tbsp') {
            unitQuantity = unitQuantity / 4;
          }
        }

        if (prettify && prevUnit && remainder) {
          renderUnit = this.prettify(Math.floor(unitQuantity), currentUnit, remainder, prevUnit);
        } else {
          renderUnit = h.round(unitQuantity) + ' ' + currentUnit;
        }
      }
    }

    this.state.ingredients[key].currentUnit = currentUnit;
    this.state.ingredients[key].prevUnit = prevUnit;
    this.state.ingredients[key].remainder = remainder;
    this.state.ingredients[key].unitQuantity = unitQuantity;
    this.state.ingredients[key].totalQuantity = totalQuantity;
    this.state.ingredients[key].renderUnit = renderUnit;
    this.setState({ ingredients : this.state.ingredients });
  },

  makePretty : function(prettify) {
    if (prettify) {
      let ingredients = this.state.ingredients;
      Object.keys(ingredients).map((key)=>{
        let currentUnit = ingredients[key].currentUnit;
        // let remainder = ingredients[key].remainder;
        let unitQuantity = ingredients[key].unitQuantity;
        let remainder = unitQuantity % Math.floor(unitQuantity);
      });
    }
  },

  changeSystem : function(metricSystem) {
    let ingredients = this.state.ingredients;
    Object.keys(ingredients).map((key)=>{
      let totalQuantity = ingredients[key].totalQuantity;
      let initUnit = ingredients[key].initUnit;
      if (metricSystem) {
        switch(initUnit) {
          case 'tsp':
            totalQuantity = totalQuantity * 4.93;
            initUnit = 'ml';
          break;
  
          case 'tbsp':
            totalQuantity = totalQuantity * 14.79;
            initUnit = 'ml';
          break;
  
          case 'cup':
            totalQuantity = totalQuantity * 236.64;
            initUnit = 'ml';
          break;
  
          case 'fl oz':
            totalQuantity = totalQuantity * 29.57;
            initUnit = 'ml';
          break;
  
          case 'cup (fl)':
            totalQuantity = totalQuantity * 236.59;
            initUnit = 'ml';
          break;
  
          case 'oz':
            totalQuantity = totalQuantity * 28.35;
            initUnit = 'grams';
          break;
  
          case 'lb':
            totalQuantity = totalQuantity * 0.454;
            initUnit = 'kg';
          break;
        } 

      } else {

        switch(initUnit) {
          case 'ml':
            totalQuantity = totalQuantity / 4.93;
            initUnit = 'tsp';
          break;
  
          //** this needs to be figured out. whats the conversion from liters to cups? and how does it know to be fluid or not?
          case 'l':
            totalQuantity = totalQuantity / 14.79;
            initUnit = 'cup (fl)';
          break;
  
          case 'grams':
            totalQuantity = totalQuantity / 28.35;
            initUnit = 'oz';
          break;
  
          case 'kg':
            totalQuantity = totalQuantity / 0.454;
            initUnit = 'lb';
          break;
        }
      }
      this.state.ingredients[key].initUnit = initUnit;
      this.state.ingredients[key].totalQuantity = totalQuantity;
      this.setState({ ingredients : this.state.ingredients });
    });

    Object.keys(ingredients).map(this.calculateServings);
  },

  prettify : function(quantRound, newUnit, remainder, prevUnit) {
  	return h.round(quantRound) + ' ' + newUnit + ' + ' + h.round(remainder) + ' ' + prevUnit;
  },

  handleUnitChange : function() {
    let metricSystem = this.state.metricSystem;
    metricSystem = metricSystem ? false : true;
    this.state.metricSystem = metricSystem;
    this.setState({ metricSystem: this.state.metricSystem});
    this.changeSystem(metricSystem);
  },

  handlePrettifyChange : function() {
    let prettify = this.state.prettify;
    prettify = prettify ? false : true;
    this.state.prettify = prettify;
    this.setState({ prettify: this.state.prettify});
    Object.keys(this.state.ingredients).map(this.calculateServings);
  },

  render : function() {
    return (
    	<div className="ingredients">
    		<div className="col-md-8">
    			<h1>Add ingredients here and then...</h1>
          <div className="switches">
            <div className="switch-units toggle">
              <label>Metric</label>
              <ToggleSwitch onClick={this.handleUnitChange} toggle={this.state.metricSystem} />
            </div>
            <div className="switch-prettify toggle">
              <label>Prettify</label>
              <ToggleSwitch onClick={this.handlePrettifyChange} toggle={this.state.prettify}/>
            </div>
          </div>
    	   	<table className="ingredient-list">
    	   	<tbody>
    	       	{Object.keys(this.state.ingredients).map(this.renderIngredient)}
    	   	</tbody>
    	   	</table>
    	   	<AddIngredientForm addIngredient={this.addIngredient} getSystem={this.getSystem} />
        </div>
        <div className="col-md-4 volumize">
    	    <CalculateServings addServings={this.addServings} servingsCurrent={this.state.servingsCurrent} />
        </div>
      </div>
    )
  }
});

var Ingredient = React.createClass({
  render : function() {
    var details = this.props.details;
    return (
    	<tr className="ingredient">  
        <td className="ingredient-name">
          {details.name}
        </td>
        <td className="ingredient-quantity">{details.renderUnit}</td>
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
      totalQuantity : this.refs.quantity.value,
      initUnit : this.refs.unit.value,
    }

    ingredient.unitQuantity = ingredient.totalQuantity;
    ingredient.currentUnit = ingredient.initUnit;
    ingredient.renderUnit = ingredient.totalQuantity + ' ' + ingredient.initUnit;

    // 3. Add the ingredient to the App State
    this.props.addIngredient(ingredient);
    this.refs.ingredientForm.reset();
  },

   renderSelect : function(item) {
    return <option key={item}>{item}</option>;
   },

  render : function() {
    var system = this.props.getSystem();
    return (
       <form className="ingredient-edit" ref="ingredientForm" onSubmit={this.createIngredient}>
			<input type="number" ref="quantity" placeholder="1" step="any" min="0" />
			<select ref="unit" placeholder="unit">
        {Object.keys(system).map(this.renderSelect)}
			</select>
      <input type="text" ref="name" placeholder="Ingredient Name" />
			<button type="submit">Add Ingredient</button>
		</form>
    )
  }
});

var CalculateServings = React.createClass({
	handleEvent : function(event, currentServings) {
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
    this.refs.servingsCurrent.value = '';
  },

	render: function() {
		return (
			<div className="volumizer">
				<h2>Volumize!</h2>
				<form ref="volumizer" onSubmit={this.handleEvent}>
					<label>Current Serving Size</label>
  	  		<input type="number" step="any" min="1" ref="servingsCurrent" placeholder={this.props.servingsCurrent} />
  	  		<label>Final Serving Size</label>
  	  		<input type="number" step="any" min="1" ref="servingsFinal" placeholder="Number of servings" />
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