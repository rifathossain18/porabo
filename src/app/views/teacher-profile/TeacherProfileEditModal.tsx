import { Check, Edit3, X } from "lucide-react";
import { useAppContext } from "../../AppContext";

export function TeacherProfileEditModal() {
  const {
    editBio,
    editExpectedFee,
    editPhilosophy,
    editSubjects,
    handleSaveProfile,
    isEditProfileOpen,
    newSubjectInput,
    setEditBio,
    setEditExpectedFee,
    setEditPhilosophy,
    setEditSubjects,
    setIsEditProfileOpen,
    setNewSubjectInput,
  } = useAppContext();

  return (
    <>
      {isEditProfileOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
              <div className="w-full max-w-lg bg-white border border-blue-200 rounded-3xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="absolute right-5 top-5 text-slate-500 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
  
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-700 flex items-center justify-center">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">
                      Edit Professional Profile
                    </h3>
                    <p className="text-xs text-slate-500">
                      Update your public biography and tutoring offerings
                    </p>
                  </div>
                </div>
  
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Professional Bio
                    </label>
                    <textarea
                      rows={4}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Describe your academic expertise, teaching experience, and methodology..."
                      className="w-full bg-white border border-blue-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Teaching Philosophy / Slogan
                    </label>
                    <input
                      type="text"
                      value={editPhilosophy}
                      onChange={(e) => setEditPhilosophy(e.target.value)}
                      placeholder="e.g. Conceptual understanding through step-by-step problem dissection."
                      className="w-full bg-white border border-blue-200 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Expected Monthly Fee (৳)
                    </label>
                    <input
                      type="number"
                      value={editExpectedFee}
                      onChange={(e) => setEditExpectedFee(Number(e.target.value))}
                      className="w-full bg-white border border-blue-200 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
  
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Subject Specializations
                    </label>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {editSubjects.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-xs flex items-center gap-1.5"
                        >
                          <span>{s}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditSubjects(
                                editSubjects.filter((_, i) => i !== idx),
                              )
                            }
                            className="hover:text-rose-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
  
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSubjectInput}
                        onChange={(e) => setNewSubjectInput(e.target.value)}
                        placeholder="Add subject (e.g. Calculus, Physics)"
                        className="flex-1 bg-white border border-blue-200 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            newSubjectInput.trim() &&
                            !editSubjects.includes(newSubjectInput.trim())
                          ) {
                            setEditSubjects([
                              ...editSubjects,
                              newSubjectInput.trim(),
                            ]);
                            setNewSubjectInput("");
                          }
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
                      >
                        Add
                      </button>
                    </div>
                  </div>
  
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditProfileOpen(false)}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium rounded-xl text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProfile}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
  
    </>
  );
}