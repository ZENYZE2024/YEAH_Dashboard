import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import AdminNavbar from '../Dashboardnavbar/Dashboardnavbar';

const Blog = () => {
    const [image, setImage] = useState(null);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [content, setContent] = useState('');
    const [editBlogId, setEditBlogId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editSlug, setEditSlug] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editImage, setEditImage] = useState(null); // State for editing image
    const [blogs, setBlogs] = useState([]);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await axios.get('https://admin.yeahtrips.in/getblogs');
                if (Array.isArray(response.data)) {
                    setBlogs(response.data);
                } else {
                    console.error('Fetched data is not an array:', response.data);
                    setBlogs([]);
                }
            } catch (error) {
                console.error('Error fetching blog posts:', error);
                setBlogs([]);
            }
        };

        fetchBlogs();
    }, []);

    const handleImageChange = (event) => {
        setImage(event.target.files[0]);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('image', image);
        formData.append('title', title);
        formData.append('slug', slug);
        formData.append('content', content);

        try {
            await axios.post('https://admin.yeahtrips.in/blog', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const blogsResponse = await axios.get('https://admin.yeahtrips.in/getblogs');
            if (Array.isArray(blogsResponse.data)) {
                setBlogs(blogsResponse.data);
            }

            setImage(null);
            setTitle('');
            setSlug('');
            setContent('');
            alert('Blog post created successfully!');
        } catch (error) {
            console.error('Error creating blog post:', error);
            alert('Error creating blog post. Please try again.');
        }
    };

    const handleUpdate = async (event) => {
        event.preventDefault();
        const formData = new FormData();

        // Retrieve the blog to update
        const blogToUpdate = blogs.find(blog => blog.id === editBlogId);

        // Use existing values if no new values are provided
        formData.append('title', editTitle || blogToUpdate.title);
        formData.append('slug', editSlug || blogToUpdate.slug);
        formData.append('content', editContent || blogToUpdate.content);

        // Only include new image if it's provided
        if (editImage) {
            formData.append('image', editImage);
        } else {
            // Use existing image URL if no new image is uploaded
            formData.append('image', blogToUpdate.image);
        }

        try {
            await axios.put(`https://admin.yeahtrips.in/updateblog/${editBlogId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },

            
            });

            // Update local state for blogs
            setBlogs(blogs.map(blog => (blog.id === editBlogId ? {
                ...blog,
                title: editTitle || blog.title,
                slug: editSlug || blog.slug,
                content: editContent || blog.content,
                image: editImage ? URL.createObjectURL(editImage) : blog.image // Correctly handle image update
            } : blog)));

            handleCancel(); 
            alert('Blog post updated successfully!');
            window.location.reload();
        } catch (error) {
            console.error('Error updating blog post:', error);
            alert('Error updating blog post. Please try again.');
        }
    };



    const handleCancel = () => {
        setEditBlogId(null);
        setEditTitle('');
        setEditSlug('');
        setEditContent('');
        setImage(null);
        setEditImage(null); // Reset the editing image
    };

    const handleDelete = async (blogId) => {
        try {
            await axios.delete(`https://admin.yeahtrips.in/deleteblog/${blogId}`);
            setBlogs(blogs.filter(blog => blog.id !== blogId));
            alert('Blog post deleted successfully!');
        } catch (error) {
            console.error('Error deleting blog post:', error);
            alert('Error deleting blog post. Please try again.');
        }
    };

    return (
        <div>
            <AdminNavbar />
            <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md space-y-6">
                <h2 className="text-3xl font-bold text-center">Create Blog Post</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="image">Image</label>
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="title">Title</label>
                        <ReactQuill
                            value={title}
                            onChange={setTitle}
                            className="h-24 border border-gray-300 rounded-lg bg-gray-50 mb-12"
                            placeholder="Enter the title here"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="slug">Slug</label>
                        <input
                            type="text"
                            id="slug"
                            value={slug}
                            onChange={(e) => setSlug(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 transition duration-200"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2" htmlFor="content">Content</label>
                        <ReactQuill
                            value={content}
                            onChange={setContent}
                            className="h-60 border border-gray-300 rounded-lg bg-gray-50 mt-4 mb-10"
                            placeholder="Write your content here..."
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 shadow-md"
                    >
                        Publish Blog Post
                    </button>
                </form>

                {/* Display the list of existing blog posts */}
                <div className="mt-8">
                    <h3 className="text-2xl font-bold">Existing Blog Posts</h3>
                    {blogs.length === 0 ? (
                        <p>No blog posts available.</p>
                    ) : (
                        blogs.map((blog) => (
                            <div key={blog.id} className="mt-4 p-4 border border-gray-300 rounded-lg">
                                {/* Edit functionality */}
                                {editBlogId === blog.id ? (
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setEditImage(e.target.files[0])} // Change editImage on file input
                                            className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 mb-2"
                                        />
                                        {editImage && (
                                            <img src={URL.createObjectURL(editImage)} alt="Preview" className="h-32 w-auto mb-2" />
                                        )}
                                        <h4 className="text-lg font-bold mb-2">
                                            <ReactQuill
                                                
                                                value={editTitle}
                                                onChange= {setEditTitle} // Edit title
                                                className="border border-gray-300 rounded-lg w-full mb-2 p-2"
                                               
                                            />
                                        </h4>
                                        <ReactQuill
                                            value={editContent}
                                            onChange={setEditContent}
                                            className="h-60 border border-gray-300 rounded-lg bg-gray-50  mb-2"
                                        />
                                        <div className="flex justify-between mt-12" >
                                            <button
                                                onClick={handleUpdate}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
                                            >
                                                Update
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-300"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        {blog.image && <img src={`https://admin.yeahtrips.in${blog.image}`} alt="Blog" className="h-32 w-auto mb-2" />}
                                        <h4 className="text-lg font-bold">{blog.title.replace(/<[^>]*>/g, '')}</h4>
                                        <p>{blog.content.replace(/<[^>]*>/g, '')}</p>

                                        <div className="flex justify-between mt-4">
                                            <button
                                                onClick={() => {
                                                    setEditBlogId(blog.id);
                                                    setEditTitle(blog.title); // Set initial title
                                                    setEditSlug(blog.slug); // Set initial slug
                                                    setEditContent(blog.content); // Set initial content
                                                }}
                                                className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition duration-300"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(blog.id)}
                                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Blog;
