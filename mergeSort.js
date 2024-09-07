// Сортировка слиянием (merge sort)
function merge(left, right) {
    let sortedArr = []
  
    while (left.length && right.length) {
      if (left[0] < right[0]) {
        sortedArr.push(left.shift())
      } else {
        sortedArr.push(right.shift())
      }
    }
    
    return [...sortedArr, ...left, ...right] 
}
  
function mergeSort(arr) {
    if (arr.length <= 1) {
        return arr
    }
  
    let mid = Math.floor(arr.length / 2)
  
    let left = mergeSort(arr.slice(0, mid))
    let right = mergeSort(arr.slice(mid))

    return merge(left, right)
  }

console.log(mergeSort([3, 5, 4, 1]))
// // //

