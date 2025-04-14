import { useState } from "react";
import { api } from "~/utils/api";
import { JudgeType } from "@prisma/client";
import Spinner from "../spinner";
import toast from "react-hot-toast";

interface CriteriaData {
  id?: string;
  criteria: string;
  maxScore: number;
  judgeType: JudgeType;
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
      // Check for specific error related to existing scores
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
    maxScore: 10,
    judgeType: JudgeType.VALIDATOR, // Default value
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentCriteria(prev => ({
      ...prev,
      [name]: name === 'maxScore' ? parseInt(value, 10) : value,
    }));
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentCriteria({
      criteria: "",
      maxScore: 10,
      judgeType: JudgeType.VALIDATOR,
    });
  };

  const handleEdit = (criteria: CriteriaData) => {
    setIsEditing(true);
    setCurrentCriteria({ ...criteria });
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this criterion? This cannot be undone.")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCriteria.criteria || currentCriteria.maxScore <= 0) {
      toast.error("Please fill in all fields correctly.");
      return;
    }

    const mutationData = {
      criteria: currentCriteria.criteria,
      maxScore: currentCriteria.maxScore,
      judgeType: currentCriteria.judgeType,
    };

    if (isEditing && currentCriteria.id) {
      updateMutation.mutate({ id: currentCriteria.id, ...mutationData });
    } else {
      addMutation.mutate(mutationData);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center p-4"><Spinner /></div>;
  if (error) return <div className="text-red-500 p-4">Error loading criteria: {error.message}</div>;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h2 className="text-2xl font-semibold mb-4">Manage Judging Criteria</h2>

      {/* Add/Edit Form */}
      <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded-lg shadow space-y-4">
        <h3 className="text-xl font-medium">{isEditing ? "Edit Criteria" : "Add New Criteria"}</h3>
        <div>
          <label htmlFor="criteria" className="block text-sm font-medium text-gray-300 mb-1">Criteria Name</label>
          <input
            type="text"
            id="criteria"
            name="criteria"
            value={currentCriteria.criteria}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
        <div>
          <label htmlFor="maxScore" className="block text-sm font-medium text-gray-300 mb-1">Max Score</label>
          <input
            type="number"
            id="maxScore"
            name="maxScore"
            value={currentCriteria.maxScore}
            onChange={handleInputChange}
            required
            min="1"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
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
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500"
          >
            {Object.values(JudgeType).map(type => (
              <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-3">
          {isEditing && (
            <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-md transition-colors">
              Cancel Edit
            </button>
          )}
          <button
            type="submit"
            disabled={addMutation.isLoading || updateMutation.isLoading}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors disabled:opacity-50"
          >
            {addMutation.isLoading || updateMutation.isLoading ? <Spinner size="small" /> : (isEditing ? "Update Criteria" : "Add Criteria")}
          </button>
        </div>
      </form>

      {/* Criteria List */}
      <div className="bg-gray-800 p-4 rounded-lg shadow">
        <h3 className="text-xl font-medium mb-4">Existing Criteria</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Max Score</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Judge Type</th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {criteriaList && criteriaList.length > 0 ? (
                criteriaList.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-100">{item.criteria}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-100">{item.maxScore}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-100">{item.JudgeType.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit({ id: item.id, criteria: item.criteria, maxScore: item.maxScore, judgeType: item.JudgeType })}
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
                  <td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-400">No criteria found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
