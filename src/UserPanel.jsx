import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoCreateOutline, IoTrashOutline, IoPencilOutline } from 'react-icons/io5';
import { RiLogoutBoxLine } from 'react-icons/ri';
import { getAuth, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getDatabase, ref as databaseRef, get, set } from 'firebase/database';
import { getStorage, ref as storageRef, deleteObject, uploadBytes } from 'firebase/storage';
import AvatarEditor from 'react-avatar-editor';
import database from './firebase';

const UserPanel = () => {
  const [userData, setUserData] = useState(null);
  const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const photoUrlParam = queryParams.get('photoUrl');
  const storage = getStorage();


  const goToCanvas = () => {
    navigate('/canvas');
  };
  const handleEditPhoto = (photoUrl) => {
    navigate(`/canvas?photoUrl=${encodeURIComponent(photoUrl)}`);
  };
  const handleLogout = () => {
    setShowLogoutConfirmation(true);
  };

  const handleLogoutConfirmation = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log('User logged out successfully.');
        navigate('/', { replace: true });
      })
      .catch((error) => {
        console.log('Error logging out:', error);
      });
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirmation(false);
  };

  const handleDeleteConfirmation = () => {
    const user = getAuth().currentUser;
    if (user) {
      const userPhotosRef = databaseRef(database, `users/${user.uid}/urls`);
      const storageReference = storageRef(getStorage(), selectedPhoto); // Use storageRef for storage reference

      // Retrieve the array of photo URLs from the database
      get(userPhotosRef)
        .then((snapshot) => {
          const photoUrls = snapshot.val();
          if (photoUrls && Array.isArray(photoUrls)) {
            // Filter out the deleted photo URL from the array
            const updatedPhotoUrls = photoUrls.filter((url) => url !== selectedPhoto);

            // Update the modified array in the database
            set(userPhotosRef, updatedPhotoUrls)
              .then(() => {
                console.log('Photo URL updated successfully in the database.');
                // Remove the photo from Firebase Storage
                deleteObject(storageReference)
                  .then(() => {
                    console.log('Photo deleted successfully from Firebase Storage.');
                    // Remove the photo from the local state
                    setPhotos(updatedPhotoUrls);
                    // Close the delete confirmation modal
                    setSelectedPhoto(null); // Reset selected photo
                    setShowDeleteConfirmation(false);
                  })
                  .catch((error) => {
                    console.log('Error deleting photo from Firebase Storage:', error);
                  });
              })
              .catch((error) => {
                console.log('Error updating photo URL in the database:', error);
              });
          }
        })
        .catch((error) => {
          console.log('Error retrieving photo URLs from the database:', error);
        });
    }
  };

  const handleCancelDelete = () => {
    setSelectedPhoto(null);
    setShowDeleteConfirmation(false);
  };

  useEffect(() => {
    const auth = getAuth();

    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const user = auth.currentUser;
        if (user) {
          const userPhotosRef = databaseRef(database, `users/${user.uid}/urls`);

          get(userPhotosRef)
            .then((snapshot) => {
              if (snapshot.exists()) {
                const photoUrls = Object.values(snapshot.val());
                setPhotos(photoUrls);
              } else {
                console.log('User photos not found in the database.');
              }
            })
            .catch((error) => {
              console.log('Error retrieving user photos:', error);
            });
        } else {
          console.log('User not authenticated.');
        }
      })
      .catch((error) => {
        console.log('Error setting auth persistence:', error);
      });
  }, []);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = databaseRef(database, `users/${user.uid}`);

        get(userRef)
          .then((snapshot) => {
            if (snapshot.exists()) {
              setUserData(snapshot.val());
            } else {
              console.log('User data not found in the database.');
            }
          })
          .catch((error) => {
            console.log('Error retrieving user data:', error);
          });
      } else {
        setUserData(null);
        console.log('User not authenticated.');
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div className='bg-gradient-to-b from-blue-100 to-indigo-200 w-screen h-screen fixed z-30'>
        <nav className="bg-gradient-to-r from-indigo-300 via-purple-400 to-blue-500 w-full p-3 drop-shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="logo flex items-center">
                <img src="/images/logo.png" alt="Logo" className="w-8 h-8" />
                <h1 className="ml-2 text-xl font-bold text-slate-900">FotoFix</h1>
              </div>
            </div>
            <div className="relative">
              {userData && (
                <div className="relative z-50">
                  <div className="user-button text-indigo-50 h-10 bg-transparent p-2 flex items-center rounded-md">
                    <img className="w-8 h-8 rounded-full mr-2" src="./images/pfp.png  " alt="" />
                    <span className="text-sm whitespace-nowrap overflow-hidden overflow-ellipsis">
                      {userData.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
        {showLogoutConfirmation && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-md">
              <p className="mb-4">Are you sure you want to log out?</p>
              <div className="flex justify-end">
                <button className="text-gray-500 mr-2" onClick={handleCancelLogout}>
                  No
                </button>
                <button className="text-red-500" onClick={handleLogoutConfirmation}>
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="relative z-10">
          <div className="photo-grid bg-indigo-100 bg-opacity-50 rounded-md drop-shadow-md flex flex-wrap justify-start gap-6 m-6 p-4 h-auto">
            {photos.map((photoUrl) => (
              <div key={photoUrl} className="bg-white rounded-lg shadow-md overflow-hidden w-40 h-56 relative">
                <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-end justify-end">
                  <button
                    className="bg-indigo-500 text-white p-2 rounded-md transition-colors duration-300 hover:bg-indigo-600"
                    onClick={() => handleEditPhoto(photoUrl)}
                  >
                    <IoPencilOutline className="w-5 h-5" />
                  </button>

                  <button
                    className="bg-red-500 text-white ml-1 p-2 rounded-md transition-colors duration-300 hover:bg-indigo-600"
                    onClick={() => {
                      setSelectedPhoto(photoUrl);
                      setShowDeleteConfirmation(true);
                    }}
                  >
                    <IoTrashOutline className="w-5 h-5" />
                  </button>
                </div>


              </div>
            ))}
          </div>
        </div>
        <button
          className="p-4 rounded-2xl fixed bottom-4 right-4 drop-shadow-sm bg-indigo-300 hover:bg-purple-200 transition-colors duration-500"
          onClick={goToCanvas}
        >
          <IoCreateOutline className="w-6 h-6 text-slate-600" />
        </button>
        <button
          className="logout-button fixed bottom-4 left-4 p-4 rounded-2xl drop-shadow-sm bg-indigo-300 hover:bg-purple-200 transition-colors duration-500"
          onClick={handleLogout}
        >
          <RiLogoutBoxLine className="w-6 h-6 text-slate-600" />
        </button>
        {showDeleteConfirmation && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
            <div className="bg-white p-4 rounded shadow-md">
              <p className="mb-4">Are you sure you want to delete this photo?</p>
              <div className="flex justify-end">
                <button className="text-gray-500 mr-2" onClick={handleCancelDelete}>
                  No
                </button>
                <button className="text-red-500" onClick={handleDeleteConfirmation}>
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserPanel;
