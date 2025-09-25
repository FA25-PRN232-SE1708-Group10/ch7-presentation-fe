const apiBaseUrl = "https://localhost:7094/api/products";

let currentPage = 1;
let pageSize = 5;
let totalResults = 0;
let sortField = null;
let sortDir = "asc";
let lastFetchedProducts = [];

function fetchProducts() {
  $.ajax({
    url: `${apiBaseUrl}?page=1&pageSize=1000`,
    method: "GET",
    success: function (response) {
      if (response.success) {
        lastFetchedProducts = response.data.items || [];
        totalResults = lastFetchedProducts.length;
        renderProducts(getPagedAndSortedProducts());
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

function getPagedAndSortedProducts() {
  let arr = [...lastFetchedProducts];
  if (sortField) {
    arr.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (sortField === "name") {
        aVal = aVal ? aVal.toLowerCase() : "";
        bVal = bVal ? bVal.toLowerCase() : "";
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }
  const start = (currentPage - 1) * pageSize;
  return arr.slice(start, start + pageSize);
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

  pagination.append(`<button class="btn btn-secondary" id="prev-page" ${currentPage === 1 ? "disabled" : ""}>Prev</button>`);

  // Always show first page
  if (currentPage === 1) {
    pagination.append(`<button class="btn btn-secondary page-btn" data-page="1" style='font-weight:bold;background:#6366f1;color:#fff;'>1</button>`);
  } else {
    pagination.append(`<button class="btn btn-secondary page-btn" data-page="1">1</button>`);
  }

  // Show ... if needed before previous page
  if (currentPage > 3) {
    pagination.append(`<span class="pagination-ellipsis">...</span>`);
  }

  // Show previous page if not first or second
  if (currentPage - 1 > 1) {
    pagination.append(`<button class="btn btn-secondary page-btn" data-page="${currentPage - 1}">${currentPage - 1}</button>`);
  }

  // Show current page if not first or last
  if (currentPage !== 1 && currentPage !== totalPages) {
    pagination.append(`<button class="btn btn-secondary page-btn" data-page="${currentPage}" style='font-weight:bold;background:#6366f1;color:#fff;'>${currentPage}</button>`);
  }

  // Show next page if not last or second to last
  if (currentPage + 1 < totalPages) {
    pagination.append(`<button class="btn btn-secondary page-btn" data-page="${currentPage + 1}">${currentPage + 1}</button>`);
  }

  // Show ... if needed after next page
  if (currentPage < totalPages - 2) {
    pagination.append(`<span class="pagination-ellipsis">...</span>`);
  }

  // Always show last page if more than one
  if (totalPages > 1) {
    if (currentPage === totalPages) {
      pagination.append(`<button class="btn btn-secondary page-btn" data-page="${totalPages}" style='font-weight:bold;background:#6366f1;color:#fff;'>${totalPages}</button>`);
    } else {
      pagination.append(`<button class="btn btn-secondary page-btn" data-page="${totalPages}">${totalPages}</button>`);
    }
  }

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
  // Add sort icons to table headers
  $("#products-table thead th").each(function (i) {
    if (i < 3) {
      $(this).css("cursor", "pointer");
      $(this).append(' <span class="sort-indicator"></span>');
    }
  });
  function updateSortIndicators() {
    $("#products-table thead th").each(function (i) {
      if (i === 0 && sortField === "id") {
        $(this)
          .find(".sort-indicator")
          .text(sortDir === "asc" ? "▲" : "▼");
      } else if (i === 1 && sortField === "name") {
        $(this)
          .find(".sort-indicator")
          .text(sortDir === "asc" ? "▲" : "▼");
      } else if (i === 2 && sortField === "price") {
        $(this)
          .find(".sort-indicator")
          .text(sortDir === "asc" ? "▲" : "▼");
      } else {
        $(this).find(".sort-indicator").text("");
      }
    });
  }
  // Sorting click handlers
  $("#products-table thead th").each(function (i) {
    if (i === 0) {
      $(this).on("click", function () {
        if (sortField === "id") {
          sortDir = sortDir === "asc" ? "desc" : "asc";
        } else {
          sortField = "id";
          sortDir = "asc";
        }
        currentPage = 1;
        renderProducts(getPagedAndSortedProducts());
        renderPagination();
        updateSortIndicators();
      });
    } else if (i === 1) {
      $(this).on("click", function () {
        if (sortField === "name") {
          sortDir = sortDir === "asc" ? "desc" : "asc";
        } else {
          sortField = "name";
          sortDir = "asc";
        }
        currentPage = 1;
        renderProducts(getPagedAndSortedProducts());
        renderPagination();
        updateSortIndicators();
      });
    } else if (i === 2) {
      $(this).on("click", function () {
        if (sortField === "price") {
          sortDir = sortDir === "asc" ? "desc" : "asc";
        } else {
          sortField = "price";
          sortDir = "asc";
        }
        currentPage = 1;
        renderProducts(getPagedAndSortedProducts());
        renderPagination();
        updateSortIndicators();
      });
    }
  });

  // Initial sort indicators
  updateSortIndicators();
  function updateCancelState() {
    const name = $("#product-name").val().trim();
    const price = $("#product-price").val().trim();
    if (name || price) {
      $("#cancel-edit").prop("disabled", false);
    } else {
      $("#cancel-edit").prop("disabled", true);
    }
  }

  // Initial state
  updateCancelState();

  // Listen for input changes
  $("#product-name, #product-price").on("input", updateCancelState);
  fetchProducts();
  updateSortIndicators();

  // Page size change
  $("#page-size").on("change", function () {
    pageSize = parseInt($(this).val());
    currentPage = 1;
    renderProducts(getPagedAndSortedProducts());
    renderPagination();
  });

  // Pagination click
  $(document).on("click", ".page-btn", function () {
    const page = parseInt($(this).data("page"));
    if (page !== currentPage) {
      currentPage = page;
      renderProducts(getPagedAndSortedProducts());
      renderPagination();
    }
  });
  $(document).on("click", "#prev-page", function () {
    if (currentPage > 1) {
      currentPage--;
      renderProducts(getPagedAndSortedProducts());
      renderPagination();
    }
  });
  $(document).on("click", "#next-page", function () {
    const totalPages = Math.ceil(totalResults / pageSize);
    if (currentPage < totalPages) {
      currentPage++;
      renderProducts(getPagedAndSortedProducts());
      renderPagination();
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
    const priceText = row.find("td:eq(2)").text();
    const price = priceText.replace(/\$/g, "");
    $("#product-id").val(id);
    $("#product-name").val(name);
    $("#product-price").val(price);
    updateCancelState();
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
    updateCancelState();
  });
});
