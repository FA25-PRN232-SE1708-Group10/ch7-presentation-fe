const apiBaseUrl = "https://localhost:7094/api/products";

let currentPage = 1;
let pageSize = 5;
let totalResults = 0;
let sortField = null;
let sortDir = "asc";
let lastFetchedProducts = [];

function fetchProducts() {
  $.getJSON(`${apiBaseUrl}?page=${currentPage}&pageSize=${pageSize}` + (sortField ? `&sortBy=${sortField}&sortOrder=${sortDir}` : ""), function (response) {
    if (response.success) {
      lastFetchedProducts = response.data.items || [];
      totalResults = response.data.totalResults || 0;
      renderProducts(lastFetchedProducts);
      renderPagination();
    } else {
      alert("Failed to fetch products");
    }
  }).fail(function () {
    alert("Error fetching products");
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

  pagination.append(`<button class="btn btn-secondary" id="prev-page" ${currentPage === 1 ? "disabled" : ""}>Prev</button>`);

  // Windowed pagination: show first, last, and a window around current page
  const windowSize = 2; // pages before/after current
  let startPage = Math.max(1, currentPage - windowSize);
  let endPage = Math.min(totalPages, currentPage + windowSize);

  // Show first page
  if (startPage > 1) {
    pagination.append(`<button class="btn btn-secondary page-btn" data-page="1">1</button>`);
    if (startPage > 2) {
      pagination.append(`<span class="pagination-ellipsis">...</span>`);
    }
  }

  // Show window of pages around current
  for (let i = startPage; i <= endPage; i++) {
    pagination.append(`<button class="btn btn-secondary page-btn" data-page="${i}" ${i === currentPage ? "style='font-weight:bold;background:#6366f1;color:#fff;'" : ""}>${i}</button>`);
  }

  // Show last page
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pagination.append(`<span class="pagination-ellipsis">...</span>`);
    }
    pagination.append(`<button class="btn btn-secondary page-btn" data-page="${totalPages}">${totalPages}</button>`);
  }

  pagination.append(`<button class="btn btn-secondary" id="next-page" ${currentPage === totalPages ? "disabled" : ""}>Next</button>`);
}

function createProduct(product) {
  $.post({
    url: apiBaseUrl,
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
  // Restore page size from localStorage if available
  const savedPageSize = localStorage.getItem("pageSize");
  if (savedPageSize) {
    pageSize = parseInt(savedPageSize);
    $("#page-size").val(savedPageSize);
  } else {
    pageSize = 5;
    $("#page-size").val("5");
  }
  // Clear product form fields on page load
  $("#product-form")[0].reset();
  $("#product-id").val("");
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
        fetchProducts();
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
        fetchProducts();
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
        fetchProducts();
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
    localStorage.setItem("pageSize", pageSize);
    currentPage = 1;
    fetchProducts();
    renderPagination();
  });

  // Pagination click
  $(document).on("click", ".page-btn", function () {
    const page = parseInt($(this).data("page"));
    if (page !== currentPage) {
      currentPage = page;
      fetchProducts();
      renderPagination();
    }
  });
  $(document).on("click", "#prev-page", function () {
    if (currentPage > 1) {
      currentPage--;
      fetchProducts();
      renderPagination();
    }
  });
  $(document).on("click", "#next-page", function () {
    const totalPages = Math.ceil(totalResults / pageSize);
    if (currentPage < totalPages) {
      currentPage++;
      fetchProducts();
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
    // Scroll to top to show the form
    window.scrollTo({ top: 0, behavior: "smooth" });
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
