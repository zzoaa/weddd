// HealthRouter.jsx
import React from "react";
import {Route, Routes} from "react-router-dom";
import HealthInfoList from "../components/Health/HealthInfoList.jsx";
import Food from "../components/Health/food/Food.jsx";
import FuncFood from "../components/Health/func_food/Func_food.jsx";
import Exercise from "../components/Health/exercise/Exercise.jsx";
import Recipe from "../components/Health/recipe/Recipe.jsx";
import HealthInfoEdit from "../components/Health/HealthInfoEdit.jsx";
import FuncFoodForm from "../components/Health/func_food/Func_food_form.jsx";
import RecipeForm from "../components/Health/recipe/Recipe_form.jsx";
import FoodForm from "../components/Health/food/Food_form.jsx";
import ExerciseForm from "../components/Health/exercise/Exercise_form.jsx";

function HealthRouter() {
  return (
    <Routes>
      <Route path="info/*" element={<HealthInfoList/>}></Route>
      <Route path="info/:cat_id" element={<HealthInfoEdit/>}></Route>
      <Route path="food" element={<Food/>}/>
      <Route path="food/:food_id" element={<FoodForm/>}/>
      <Route path="func_food" element={<FuncFood/>}/>
      <Route path="func_food/:food_id" element={<FuncFoodForm/>}/>
      <Route path="exercise" element={<Exercise/>}/>
      <Route path="exercise/:ex_id" element={<ExerciseForm/>}/>
      <Route path="recipe" element={<Recipe/>}/>
      <Route path="recipe/:rec_id" element={<RecipeForm/>}/>
    </Routes>
  );
}

export default HealthRouter;
