export function mergeDuplicateObjects(arr) {
  const objectMap = new Map(); // Create a Map to store unique objects

  for (const obj of arr) {
    const objKey = JSON.stringify(obj); // Convert the object to a string for comparison

    if (objectMap.has(objKey)) {
      // If the object string is already in the map, merge the objects
      const existingObj = JSON.parse(objKey); // Get the existing object
      const newObj = { ...existingObj, ...obj }; // Merge the objects
      objectMap.set(objKey, JSON.stringify(newObj)); // Update the merged object in the map
    } else {
      // Otherwise, add the object to the map
      objectMap.set(objKey, objKey);
    }
  }

  // Convert the map values back to objects
  const mergedArray = [...objectMap.values()].map((objString) =>
    JSON.parse(objString)
  );

  return mergedArray;
}
