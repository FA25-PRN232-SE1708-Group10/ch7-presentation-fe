const apiBaseUrl = "https://localhost:7094/api/products";

function fetchProducts() {
  $.ajax({
    url: apiBaseUrl + "?page=1&pageSize=10",
    method: "GET",
    success: function (response) {
      if (response.success) {
        renderProducts(response.data.items);
      } else {
        alert("Failed to fetch products");
      }
    },
    error: function () {
      alert("Error fetching products");
    },
  });
}

function renderProducts(products) {
  const tbody = $("#products-table tbody");
  tbody.empty();
  products.forEach((product) => {
    tbody.append(`
      <tr>
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>$${product.price}</td>
        <td>
          <button class="edit-btn" data-id="${product.id}">Edit</button>
          <button class="delete-btn" data-id="${product.id}">Delete</button>
        </td>
      </tr>
    `);
  });
}

function createProduct(product) {
  $.ajax({
    url: apiBaseUrl,
    method: "POST",
    contentType: "application/json",
    data: JSON.stringify(product),
    success: function () {
      fetchProducts();
      $("#product-form")[0].reset();
    },
    error: function () {
      alert("Error creating product");
    },
  });
}

function updateProduct(id, product) {
  $.ajax({
    url: apiBaseUrl + "/" + id,
    method: "PUT",
    contentType: "application/json",
    data: JSON.stringify(product),
    success: function () {
      fetchProducts();
      $("#product-form")[0].reset();
      $("#product-id").val("");
    },
    error: function () {
      alert("Error updating product");
    },
  });
}

function deleteProduct(id) {
  $.ajax({
    url: apiBaseUrl + "/" + id,
    method: "DELETE",
    success: function () {
      fetchProducts();
    },
    error: function () {
      alert("Error deleting product");
    },
  });
}

$(document).ready(function () {
  fetchProducts();

  $("#product-form").submit(function (e) {
    e.preventDefault();
    const id = $("#product-id").val();
    const name = $("#product-name").val();
    const price = parseFloat($("#product-price").val());
    if (isNaN(price) || price < 0.01) {
      alert("Price must be at least $0.01");
      $("#product-price").focus();
      return;
    }
    const product = { name, price };
    if (id) {
      updateProduct(id, product);
    } else {
      createProduct(product);
    }
  });

  $("#products-table").on("click", ".edit-btn", function () {
    const row = $(this).closest("tr");
    const id = $(this).data("id");
    const name = row.find("td:eq(1)").text();
    // Remove $ if present for editing
    const priceText = row.find("td:eq(2)").text();
    const price = priceText.replace(/\$/g, "");
    $("#product-id").val(id);
    $("#product-name").val(name);
    $("#product-price").val(price);
  });

  $("#products-table").on("click", ".delete-btn", function () {
    if (confirm("Delete this product?")) {
      const id = $(this).data("id");
      deleteProduct(id);
    }
  });

  $("#cancel-edit").click(function () {
    $("#product-form")[0].reset();
    $("#product-id").val("");
  });
});
