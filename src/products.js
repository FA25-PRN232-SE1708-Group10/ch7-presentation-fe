const apiBaseUrl = "https://localhost:7094/api/products";
let currentPage = 1;
let pageSize = 5;
let totalResults = 0;

function fetchProducts(page = currentPage, size = pageSize) {
  $.ajax({
    url: `${apiBaseUrl}?page=${page}&pageSize=${size}`,
    method: "GET",
    success: function (response) {
      if (response.success) {
        totalResults = response.data.totalResults;
        renderProducts(response.data.items);
        renderPagination();
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

function renderPagination() {
  const totalPages = Math.ceil(totalResults / pageSize);
  const pagination = $("#pagination");
  pagination.empty();
  if (totalPages <= 1) return;
  // Prev button
  pagination.append(`<button class="btn btn-secondary" id="prev-page" ${currentPage === 1 ? "disabled" : ""}>Prev</button>`);
  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    pagination.append(`<button class="btn btn-secondary page-btn" data-page="${i}" ${i === currentPage ? "style='font-weight:bold;background:#6366f1;color:#fff;'" : ""}>${i}</button>`);
  }
  // Next button
  pagination.append(`<button class="btn btn-secondary" id="next-page" ${currentPage === totalPages ? "disabled" : ""}>Next</button>`);
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

  // Page size change
  $("#page-size").on("change", function () {
    pageSize = parseInt($(this).val());
    currentPage = 1;
    fetchProducts();
  });

  // Pagination click
  $(document).on("click", ".page-btn", function () {
    const page = parseInt($(this).data("page"));
    if (page !== currentPage) {
      currentPage = page;
      fetchProducts();
    }
  });
  $(document).on("click", "#prev-page", function () {
    if (currentPage > 1) {
      currentPage--;
      fetchProducts();
    }
  });
  $(document).on("click", "#next-page", function () {
    const totalPages = Math.ceil(totalResults / pageSize);
    if (currentPage < totalPages) {
      currentPage++;
      fetchProducts();
    }
  });

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
