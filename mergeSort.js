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

// 'fsdfsdfsdf'
// 'sdfsdfsdfsdfdsf'
// 'sdfsdfsdf45345345345345345



// 5675676328402830948230849023534556
// 60756070567905


// from branch1 - 548634953453
// from branch1 - 758679=-80==--=-=
// from branch1 - 75890890890890890890890890


// from branch1 new1
// from branch1 new2