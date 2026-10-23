var cl = console.log;

const productForm = document.getElementById("productForm")
const pName = document.getElementById("pName")
const price = document.getElementById("price")
const category = document.getElementById("category")
const quantity = document.getElementById("quantity")
const addBtn = document.getElementById("addBtn")
const updateBtn = document.getElementById("updateBtn")
const clearBtn = document.getElementById("clearBtn")
const stock = document.getElementById("stock")
const addButtonMain = document.getElementById("addButtonMain")
const crossMark = document.getElementById("crossMark")
const productRow = document.getElementById("productRow")
const formHeading = document.getElementById("formHeading")
const productCountHeading = document.getElementById("productCountHeading")
const spinner = document.getElementById("spinner")

const state = {
    productsArray: [],
    edit_id: null
}

const BASE_URL = `https://gaurav2-1b96d-default-rtdb.firebaseio.com/`
const PRODUCT_URL = `${BASE_URL}/fetchGenericProducts2.json`

//=============== Generic function ============
function genericApiCall(URL, METHOD, BODY) {
    BODY = BODY ? JSON.stringify(BODY) : null
    return fetch(URL, {
        method: METHOD,
        body: BODY,
    })
        .then(res => {
            if (!res.ok) {
                throw new Error(`HTTP Error : ${res.status}`)
            }
            return res.json()
        })
}
//=============== Create ======================
function addNewProduct(eve) {
    eve.preventDefault()

    let newProduct = {
        pName: pName.value,
        price: price.value,
        category: category.value,
        stock: stock.value === "Yes" ? "In stock" : "Out of stock",
        quantity: stock.value === "Yes" ? quantity.value: 0
    }

    showSpinner("text-success")
    genericApiCall(PRODUCT_URL, "POST", newProduct)
        .then(data => {
            newProduct.id = data.name
            state.productsArray.unshift(newProduct)

            let row = document.createElement("div")
            row.className = "row"
            row.id = data.name
            row.innerHTML = `
                            <div class="col-md-4">
                                <h5>${newProduct.pName}</h5>
                                <p class="text-primary price">Rs. ${newProduct.price}</p>
                            </div>

                            <div class="col-md-2"> ${newProduct.category} </div>
                            <div class="col-md-2">${newProduct.stock}</div>
                            <div class="col-md-2">${newProduct.quantity} pieces</div>

                            <div class="col-md-1">
                                <button onClick="editProduct(this)" class="btn btn-primary"> Edit</button>
                            </div>
                            <div class="col-md-1">
                                <button onClick="deleteProduct(this)" class="btn btn-danger">Delete</button>
                            </div>        
                         `

            productRow.prepend(row)
            productCountHeading.innerHTML = `${state.productsArray.length} Total products`
            hideForm()
            clearForm()
            showSnackBar("Created!", "Product Created Successfully !!!!", "success")
        })
        .catch(err => {
            showSnackBar("Error", err, "error")
        })
        .finally(() => {
            hideSpinner("text-success")
        })
}
//=============== Read ========================
function fetchProducts(products) {
    showSpinner("text-primary")
    genericApiCall(PRODUCT_URL, "GET")
        .then(data => {

            for (const key in data) {
                data[key].id = key
                state.productsArray.unshift(data[key])
            }

            let result = ``
            products.forEach(ele => {
                result += ` <div class="row" id=${ele.id}>
                            <div class="col-md-4">
                                <h5>${ele.pName}</h5>
                                <p class="text-primary price">Rs. ${ele.price}</p>
                            </div>

                            <div class="col-md-2"> ${ele.category} </div>
                            <div class="col-md-2 ">${ele.stock}</div>
                            <div class="col-md-2">${ele.quantity} pieces</div>


                            <div class="col-md-1">
                                <button onClick="editProduct(this)" class="btn btn-primary"> Edit</button>
                            </div>
                            <div class="col-md-1">
                                <button onClick="deleteProduct(this)" class="btn btn-danger">Delete</button>
                            </div>
                        </div> 
                            `
            });

            productRow.innerHTML = result
            productCountHeading.innerHTML = `${state.productsArray.length} Total products`

        })
        .catch(err => {
            showSnackBar("Error", err, "error")
        })
        .finally(f => {
            hideSpinner("text-primary")
        })
}
fetchProducts(state.productsArray)
//=============== Edit ========================
function editProduct(ele) {
    let EDIT_ID = ele.closest(".row").id;
    let EDIT_URL = `${BASE_URL}/fetchGenericProducts2/${EDIT_ID}.json`

    showSpinner("text-success")
    genericApiCall(EDIT_URL, "GET")
        .then(data => {
            pName.value = data.pName
            category.value = data.category
            price.value = data.price
            stock.value = data.stock === "In stock" ? "Yes" : "No"
            quantity.value = data.quantity

            addBtn.classList.add("d-none")
            updateBtn.classList.remove("d-none")
            showform()
            formHeading.innerHTML = "Update Product"
            state.edit_id = EDIT_ID

        })
        .catch(err => {
            showSnackBar("Error", err, "error")
        })
        .finally(f => {
            hideSpinner("text-success")
        })
}
//=============== Update ======================
function updateProduct(eve) {
    let UPDATE_ID = state.edit_id;
    let UPDATE_URL = `${BASE_URL}/fetchGenericProducts2/${UPDATE_ID}.json`

    let updatedObj = {
        pName: pName.value,
        price: price.value,
        category: category.value,
        stock: stock.value === "Yes" ? "In stock" : "Out of stock",
        quantity: stock.value === "Yes" ? quantity.value: 0,
        id: UPDATE_ID
    }

    showSpinner("text-success")
    genericApiCall(UPDATE_URL, "PATCH", updatedObj)
        .then(data => {
            state.edit_id = null;
            document.getElementById(UPDATE_ID).innerHTML = `
                            <div class="col-md-4">
                                <h5>${updatedObj.pName}</h5>
                                <p class="text-primary price">Rs. ${updatedObj.price}</p>
                            </div>

                            <div class="col-md-2"> ${updatedObj.category} </div>
                            <div class="col-md-2">${updatedObj.stock}</div>
                            <div class="col-md-2">${updatedObj.quantity} pieces</div>


                            <div class="col-md-1">
                                <button onClick="editProduct(this)" class="btn btn-primary"> Edit</button>
                            </div>
                            <div class="col-md-1">
                                <button onClick="deleteProduct(this)" class="btn btn-danger">Delete</button>
                            </div>
                    `
            let getIndex = state.productsArray.findIndex(ele => ele.id === UPDATE_ID)
            state.productsArray[getIndex] = updatedObj

            addBtn.classList.remove("d-none")
            updateBtn.classList.add("d-none")
            hideForm()
            clearForm()
            showSnackBar("Update!", "Product Updated Successfully !!!!", "success")
        })
        .catch(err => {
            showSnackBar("Error", err, "error")
        })
        .finally(() => {
            hideSpinner("text-success")
        })

}
//=============== Delete ======================
function deleteProduct(ele) {
    let DELETE_ID = ele.closest(".row").id
    let DELETE_URL = `${BASE_URL}/fetchGenericProducts2/${DELETE_ID}.json`


    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            showSpinner("text-danger")
            genericApiCall(DELETE_URL, "DELETE")
                .then(data => {
                    let getIndex = state.productsArray.findIndex(ele => ele.id === DELETE_ID)
                    state.productsArray.splice(getIndex, 1)

                    ele.closest(".row").remove()
                    productCountHeading.innerHTML = `${state.productsArray.length} Total products`
                    showSnackBar("Removed!", "Product Removed Successfully !!!!", "success")

                })
                .catch(err => {
                    showSnackBar("Error", err, "error")
                })
                .finally(() => {
                    hideSpinner("text-danger")

                })
        }
    });
}
function showSnackBar(title, msg, icon) {
    Swal.fire({
        title: title,
        text: msg,
        icon: icon
    });
}
function showSpinner(color) {
    spinner.classList.remove("d-none")
    spinner.classList.add(color)
}
function hideSpinner(color) {
    spinner.classList.add("d-none")
    spinner.classList.remove(color)
}

function clearForm() {
    productForm.reset()
    addBtn.classList.remove("d-none")
    updateBtn.classList.add("d-none")
    formHeading.innerText = "Add Product"
}

function showform() {
    formColumn.style.top = "0px"
    formColumn.style.pointerEvents = "auto"
    formColumn.style.opacity = "1"
    formHeading.innerText = "Add Product"
}

function hideForm() {
    formColumn.style.marginTop = "-100vh"
    formColumn.style.pointerEvents = "none"
    formColumn.style.opacity = "0"
    formHeading.innerText = "Add Product"
    clearForm()
}

addButtonMain.addEventListener("click", showform)
crossMark.addEventListener("click", hideForm)
productForm.addEventListener("submit", addNewProduct)
updateBtn.addEventListener("click", updateProduct)
clearBtn.addEventListener("click", clearForm)




