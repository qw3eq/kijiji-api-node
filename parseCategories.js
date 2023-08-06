/*
  This script will parse the ad categories from Kijiji and save them to a JSON file.
  This can be ran to update the categories.json file.
*/


import axios from "axios";
import fs from "fs";

(async () => {

  const req = await axios.get('https://www.kijiji.ca/j-select-category.json');
  const categories = req.data.level1.items.map(category => {
    return { name: category.name, id: category.categoryId };
  });

  async function getSubCategories(categoryId) {
    const req = await axios.get(`https://www.kijiji.ca/j-select-category.json?categoryId=${categoryId}`);
    const subCategories = req.data.level2.items.map(category => {
      return { name: category.name, id: category.categoryId };
    });

    return subCategories;
  }

  async function getSubSubCategories(categoryId) {
    const req = await axios.get(`https://www.kijiji.ca/j-select-category.json?categoryId=${categoryId}`);

    if (req.data.level3.length === 0) return [];

    const subCategories = req.data.level3.items.map(category => {
      return { name: category.name, id: category.categoryId };
    });

    return subCategories;
  }

  for (let category of categories) {
    console.log("Doing category: " + category.name + "...")
    console.log("Left to do: " + categories.length + "...")
    const subCategories = await getSubCategories(category.id);
    category.subCategories = subCategories;

    subCategories.forEach(async subCategory => {
      const subSubCategories = await getSubSubCategories(subCategory.id);
      subCategory.subCategories = subSubCategories;
    });
  }

  fs.writeFileSync('./categories.json', JSON.stringify(categories), null, 2);

})();