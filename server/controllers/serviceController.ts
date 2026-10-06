import { Request, Response } from 'express';
import { Service } from '../models/Service.ts';

/**
 * @desc    Get all bookable services
 * @route   GET /api/services
 * @access  Public (optional ?all=true for admins)
 */
export const getAllServices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { all, category } = req.query;

    const query: any = {};
    if (all !== 'true') {
      query.isActive = true;
    }
    if (category) {
      query.category = category;
    }

    const services = await Service.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: services.length,
      data: services,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching services',
    });
  }
};

/**
 * @desc    Get a single service by ID
 * @route   GET /api/services/:id
 * @access  Public
 */
export const getServiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching service details',
    });
  }
};

/**
 * @desc    Create a new service
 * @route   POST /api/services
 * @access  Private/Admin
 */
export const createService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, duration, price, category, availableDays, workingHours, imageUrl, isActive } = req.body;

    if (!name || !description || duration === undefined || price === undefined) {
      res.status(400).json({
        success: false,
        message: 'Please provide name, description, duration, and price',
      });
      return;
    }

    const existingService = await Service.findOne({ name: name.trim() });
    if (existingService) {
      res.status(400).json({
        success: false,
        message: 'A service with this name already exists',
      });
      return;
    }

    const service = await Service.create({
      name: name.trim(),
      description,
      duration: Number(duration),
      price: Number(price),
      category: category || 'General',
      availableDays: availableDays || [1, 2, 3, 4, 5, 6],
      workingHours: workingHours || { start: '09:00', end: '17:00', slotInterval: 30 },
      imageUrl: imageUrl || '',
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating service',
    });
  }
};

/**
 * @desc    Update an existing service
 * @route   PUT /api/services/:id
 * @access  Private/Admin
 */
export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found',
      });
      return;
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: updatedService,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating service',
    });
  }
};

/**
 * @desc    Delete a service
 * @route   DELETE /api/services/:id
 * @access  Private/Admin
 */
export const deleteService = async (req: Request, res: Response): Promise<void> => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      res.status(404).json({
        success: false,
        message: 'Service not found',
      });
      return;
    }

    await Service.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting service',
    });
  }
};
