import React, { useState, Fragment } from 'react';
import { MdClose, MdCheck, MdKeyboardArrowDown } from 'react-icons/md';
import { Listbox, Transition } from '@headlessui/react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AddJudgePopupProps {
  users: User[];
  onClose: () => void;
  onSubmit: (userId: string) => void;
}

const AddJudgePopup: React.FC<AddJudgePopupProps> = ({
  users,
  onClose,
  onSubmit,
}) => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      onSubmit(selectedUser);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Add Judge</h2>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <MdClose className="h-6 w-6" />
        </button>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4 z-20">
            <label className="mb-2 block text-sm font-medium">Select User</label>
            
            {/* HeadlessUI Listbox component with contained dropdown */}
            <Listbox value={selectedUser} onChange={setSelectedUser}>
              <div className="relative mt-1">
                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm">
                  <span className="block truncate">
                    {selectedUser ? 
                      users.find(user => user.id === selectedUser)?.name ?? "Select a user" : 
                      "Select a user"}
                  </span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                    <MdKeyboardArrowDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
                  </span>
                </Listbox.Button>
                
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-30">
                    {users.map((user) => (
                      <Listbox.Option
                        key={user.id}
                        value={user.id}
                        className={({ active }: { active: boolean }) =>
                          `relative cursor-default select-none py-2 pl-10 pr-4 ${
                            active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                          }`
                        }
                      >
                        {({ selected }: { selected: boolean }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {user.name} ({user.email})
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                <MdCheck className="h-5 w-5" aria-hidden="true" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>

            <div className="mt-6 flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedUser}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Add Judge
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddJudgePopup;
