import { useState } from "react";
import { api } from "~/utils/api";
import { JudgeType } from "@prisma/client";
import Spinner from "../spinner";
import toast from "react-hot-toast";

interface CriteriaData {
  id?: string;
  criteria: string;
  judgeType: JudgeType;
}

// Simple confirmation modal component
function ConfirmationModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel 
}: { 
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-xl font-medium mb-4">{title}</h3>
        <p className="mb-6 text-gray-300">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-medium rounded-md"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CriteriaTab() {
  const utils = api.useUtils();
  const { data: criteriaList, isLoading, error } = api.organiser.getCriteria.useQuery();
  const addMutation = api.organiser.addCriteria.useMutation({
    onSuccess: () => {
      void utils.organiser.getCriteria.invalidate();
      toast.success("Criteria added successfully!");
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to add criteria: ${error.message}`);
    },
  });
  const updateMutation = api.organiser.updateCriteria.useMutation({
    onSuccess: () => {
      void utils.organiser.getCriteria.invalidate();
      toast.success("Criteria updated successfully!");
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to update criteria: ${error.message}`);
    },
  });
  const deleteMutation = api.organiser.deleteCriteria.useMutation({
    onSuccess: () => {
      void utils.organiser.getCriteria.invalidate();
      toast.success("Criteria deleted successfully!");
    },
    onError: (error) => {
      if (error.message.includes("related records")) {
         toast.error("Cannot delete criteria with existing scores.");
      } else {
         toast.error(`Failed to delete criteria: ${error.message}`);
      }
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [currentCriteria, setCurrentCriteria] = useState<CriteriaData>({
    criteria: "",
    judgeType: JudgeType.VALIDATOR,
  });

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItemForDelete, setSelectedItemForDelete] = useState<string | null>(null);
  const [pendingEditItem, setPendingEditItem] = useState<CriteriaData | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentCriteria(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentCriteria({
      criteria: "",
      judgeType: JudgeType.VALIDATOR,
    });
  };

  const handleEdit = (criteria: CriteriaData) => {
    setPendingEditItem(criteria);
    setShowEditModal(true);
  };
  
  const confirmEdit = () => {
    if (pendingEditItem) {
      setIsEditing(true);
      setCurrentCriteria({ 
        id: pendingEditItem.id, 
        criteria: pendingEditItem.criteria, 
        judgeType: pendingEditItem.judgeType 
      });
      setPendingEditItem(null);
      setShowEditModal(false);
    }
  };

  const handleDelete = (id: string) => {
    setSelectedItemForDelete(id);
    setShowDeleteModal(true);
  };
  
  const confirmDelete = () => {
    if (selectedItemForDelete) {
      deleteMutation.mutate({ id: selectedItemForDelete });
      setShowDeleteModal(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCriteria.criteria) {
      toast.error("Please fill in the criteria name.");
      return;
    }

    const mutationData = {
      criteria: currentCriteria.criteria,
      maxScore: 10,
      judgeType: currentCriteria.judgeType,
    };

    if (isEditing && currentCriteria.id) {
      updateMutation.mutate({ id: currentCriteria.id, ...mutationData });
      console.log("Updating criteria:", currentCriteria.id, mutationData);
    } else {
      addMutation.mutate(mutationData);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center p-4"><Spinner /></div>;
  if (error) return <div className="text-red-500 p-4">Error loading criteria: {error.message}</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h2 className="text-4xl text-center font-semibold mb-4">Manage Judging Criteria</h2>

      <form onSubmit={handleSubmit} className="p-4 rounded-lg shadow space-y-4">
        <h3 className="text-xl font-medium">{isEditing ? `Edit Criteria: ${currentCriteria.criteria}` : "Add New Criteria"}</h3>
        <div>
          <label htmlFor="criteria" className="block text-sm font-medium text-gray-300 mb-1">Criteria Name</label>
          <input
            type="text"
            id="criteria"
            name="criteria"
            value={currentCriteria.criteria}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border bg-transparent border-gray-600 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div>
          <label htmlFor="judgeType" className="block text-sm font-medium text-gray-300 mb-1">Judge Type / Round</label>
          <select
            id="judgeType"
            name="judgeType"
            value={currentCriteria.judgeType}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 bg-transparent border border-gray-600 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          >
            {Object.values(JudgeType).map(type => (
              <option className="bg-transparent text-black" key={type} value={type}>{type.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-center space-x-3 mt-4">
          {isEditing && (
            <button 
              type="button" 
              onClick={resetForm} 
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
            >
              Cancel Edit
            </button>
          )}
          <button
            type="submit"
            disabled={addMutation.isLoading || updateMutation.isLoading}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-md transition-colors disabled:opacity-50 shadow-md"
          >
            {addMutation.isLoading || updateMutation.isLoading ? <Spinner size="small" /> : (isEditing ? "Update Criteria" : "Add Criteria")}
          </button>
        </div>
      </form>

      <div className="p-4 rounded-lg shadow">
        <h3 className="text-xl font-medium mb-4">Existing Criteria</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Judge Type</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {criteriaList && criteriaList.length > 0 ? (
                criteriaList.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-100">{item.criteria}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-100">{item.JudgeType.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit({ id: item.id, criteria: item.criteria, judgeType: item.JudgeType })}
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteMutation.isLoading && deleteMutation.variables?.id === item.id}
                        className="text-red-500 hover:text-red-400 disabled:opacity-50"
                      >
                        {deleteMutation.isLoading && deleteMutation.variables?.id === item.id ? <Spinner size="small" /> : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-center text-sm text-gray-400">No criteria found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        title="Confirm Deletion"
        message="Are you sure you want to delete this criterion? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
      
      <ConfirmationModal
        isOpen={showEditModal}
        title="Confirm Edit"
        message={`Do you want to edit the criterion "${pendingEditItem?.criteria}"? Any unsaved changes to the current form will be lost.`}
        onConfirm={confirmEdit}
        onCancel={() => {
          setShowEditModal(false);
          setPendingEditItem(null);
        }}
      />
    </div>
  );
}
