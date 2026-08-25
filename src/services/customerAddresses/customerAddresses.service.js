const prisma = require("../../config/db");

function notFoundError(message = "Address not found.") {
  const err = new Error(message);
  err.statusCode = 404;
  err.expose = true;
  return err;
}

async function listAddresses(customerId) {
  return prisma.customerAddress.findMany({
    where: { customerId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
  });
}

async function createAddress(customerId, data) {
  const existingCount = await prisma.customerAddress.count({ where: { customerId } });
  // First address is always the default, regardless of what was sent.
  const shouldBeDefault = existingCount === 0 || data.isDefault === true;

  return prisma.$transaction(async (tx) => {
    if (shouldBeDefault) {
      await tx.customerAddress.updateMany({ where: { customerId }, data: { isDefault: false } });
    }
    return tx.customerAddress.create({
      data: {
        customerId,
        label: data.label?.trim() || "Home",
        addressLine: data.addressLine.trim(),
        area: data.area?.trim() || null,
        pincode: data.pincode ? String(data.pincode).trim() : null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        isDefault: shouldBeDefault,
      },
    });
  });
}

/** Every lookup is scoped by customerId - one customer can never touch another's address. */
async function updateAddress(customerId, addressId, data) {
  const existing = await prisma.customerAddress.findFirst({ where: { id: addressId, customerId } });
  if (!existing) throw notFoundError();

  return prisma.$transaction(async (tx) => {
    if (data.isDefault === true) {
      await tx.customerAddress.updateMany({ where: { customerId }, data: { isDefault: false } });
    }

    const updateData = {};
    if (data.label !== undefined) updateData.label = data.label.trim();
    if (data.addressLine !== undefined) updateData.addressLine = data.addressLine.trim();
    if (data.area !== undefined) updateData.area = data.area?.trim() || null;
    if (data.pincode !== undefined) updateData.pincode = data.pincode ? String(data.pincode).trim() : null;
    if (data.latitude !== undefined) updateData.latitude = data.latitude;
    if (data.longitude !== undefined) updateData.longitude = data.longitude;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;

    return tx.customerAddress.update({ where: { id: addressId }, data: updateData });
  });
}

async function deleteAddress(customerId, addressId) {
  const existing = await prisma.customerAddress.findFirst({ where: { id: addressId, customerId } });
  if (!existing) throw notFoundError();

  await prisma.customerAddress.delete({ where: { id: addressId } });

  // Never leave a customer with addresses but no default.
  if (existing.isDefault) {
    const next = await prisma.customerAddress.findFirst({
      where: { customerId },
      orderBy: { createdAt: "asc" },
    });
    if (next) {
      await prisma.customerAddress.update({ where: { id: next.id }, data: { isDefault: true } });
    }
  }

  return { deletedId: addressId };
}

async function setDefaultAddress(customerId, addressId) {
  const existing = await prisma.customerAddress.findFirst({ where: { id: addressId, customerId } });
  if (!existing) throw notFoundError();

  return prisma.$transaction(async (tx) => {
    await tx.customerAddress.updateMany({ where: { customerId }, data: { isDefault: false } });
    return tx.customerAddress.update({ where: { id: addressId }, data: { isDefault: true } });
  });
}

module.exports = { listAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress };
